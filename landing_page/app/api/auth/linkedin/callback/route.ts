import { NextRequest, NextResponse } from "next/server";

// --- Configuration ---
// Ensure these are set in your environment variables
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
// This is the Redirect URI registered in your LinkedIn App and used for the token exchange.
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_PROFILE_URL = "https://api.linkedin.com/v2/userinfo"; // OpenID Connect endpoint for user info

// --- Types for API Responses ---
interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number; // seconds
  scope: string;
  token_type: "Bearer";
  id_token?: string; // If using 'openid' scope, an ID token might be returned
}

interface LinkedInProfileResponse {
  sub: string; // Unique LinkedIn user ID
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string; // URL to profile picture
  email?: string;
  email_verified?: boolean;
  // Add other fields based on the scopes you request (e.g., 'profile', 'email')
}

// --- Helper Functions ---
/**
 * Creates a redirect URL to the home page with specified query parameters.
 */
function createErrorRedirect(
  request: NextRequest,
  errorType: string,
  errorDescription?: string,
  additionalParams?: Record<string, string>
): URL {
  const homeUrl = new URL("/", request.nextUrl.origin);
  homeUrl.searchParams.set("linkedin_auth_status", "error"); // General error status
  homeUrl.searchParams.set("linkedin_error", errorType);
  if (errorDescription) {
    homeUrl.searchParams.set("linkedin_error_description", errorDescription);
  }
  if (additionalParams) {
    for (const [key, value] of Object.entries(additionalParams)) {
      homeUrl.searchParams.set(key, value);
    }
  }
  return homeUrl;
}

function createSuccessRedirect(request: NextRequest): URL {
  const homeUrl = new URL("/", request.nextUrl.origin);
  homeUrl.searchParams.set("linkedin_auth_status", "success");
  // Avoid passing sensitive user data in query params.
  // The client should fetch user details from a secure API endpoint after successful login,
  // relying on the session established by the server.
  return homeUrl;
}


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const receivedState = searchParams.get("state");
  const linkedinError = searchParams.get("error"); // e.g., "user_cancelled_login"
  const linkedinErrorDescription = searchParams.get("error_description");

  const storedState = request.cookies.get("linkedin_oauth_state")?.value;

  const responseHeaders = new Headers();
  // Clear the state cookie immediately after retrieving it.
  // Add 'Secure' in production if your site is HTTPS only.
  // Add 'HttpOnly' if it were a server-set sensitive cookie (not the case for state).
  responseHeaders.append('Set-Cookie', `linkedin_oauth_state=; Path=/; Max-Age=0; SameSite=Lax; Secure; HttpOnly`);


  // 1. Handle explicit errors from LinkedIn (e.g., user cancellation)
  if (linkedinError) {
    console.warn(`LinkedIn OAuth Explicit Error: ${linkedinError}, Description: ${linkedinErrorDescription || 'No description'}`);
    const redirectUrl = createErrorRedirect(request, linkedinError, linkedinErrorDescription);
    return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
  }

  // 2. Validate server configuration
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !LINKEDIN_REDIRECT_URI) {
    console.error("Server-side LinkedIn OAuth environment variables are not fully configured.");
    const redirectUrl = createErrorRedirect(request, "server_config_error", "OAuth configuration is incomplete on the server.");
    return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
  }

  // 3. Validate CSRF state token
  if (!storedState) {
    console.error("OAuth State cookie ('linkedin_oauth_state') not found. Possible CSRF or cookie issue.");
    const redirectUrl = createErrorRedirect(request, "state_cookie_missing", "Authentication state missing. Please try again.");
    return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
  }
  if (!receivedState || receivedState !== storedState) {
    console.error(`Invalid OAuth State. Possible CSRF. Received: "${receivedState}", Expected: "${storedState}"`);
    const redirectUrl = createErrorRedirect(request, "state_mismatch", "Invalid authentication state. Please try again.");
    return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
  }

  // 4. Ensure authorization code is present
  if (!code) {
    console.error("Authorization code not found in callback from LinkedIn.");
    const redirectUrl = createErrorRedirect(request, "code_missing", "Authorization code not provided by LinkedIn.");
    return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
  }

  try {
    // 5. Exchange authorization code for an access token
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: LINKEDIN_REDIRECT_URI,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
    });

    const tokenResponse = await fetch(LINKEDIN_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      let errorDetailsMessage = "Failed to obtain access token from LinkedIn.";
      try {
        const parsedError = JSON.parse(errorText);
        errorDetailsMessage = parsedError.error_description || parsedError.error || errorDetailsMessage;
      } catch {
        // If error response is not JSON, use the raw text or a generic message
        console.warn("LinkedIn token error response was not valid JSON:", errorText);
      }
      console.error(`LinkedIn Token API Error (Status: ${tokenResponse.status}): ${errorDetailsMessage}`, errorText);
      const redirectUrl = createErrorRedirect(request, "token_exchange_failed", errorDetailsMessage);
      return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
    }

    const tokenData = await tokenResponse.json() as LinkedInTokenResponse;
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("Access token not found in LinkedIn's response:", tokenData);
      const redirectUrl = createErrorRedirect(request, "access_token_missing", "No access token received from LinkedIn.");
      return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
    }

    // 6. Fetch user profile from LinkedIn
    const profileResponse = await fetch(LINKEDIN_PROFILE_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      let errorDetailsMessage = "Failed to fetch user profile from LinkedIn.";
      try {
        const parsedError = JSON.parse(errorText);
        // For userinfo endpoint, error might be in 'message' or other fields
        errorDetailsMessage = parsedError.message || parsedError.error_description || parsedError.error || errorDetailsMessage;
      } catch {
        console.warn("LinkedIn profile error response was not valid JSON:", errorText);
      }
      console.error(`LinkedIn Profile API Error (Status: ${profileResponse.status}): ${errorDetailsMessage}`, errorText);
      const redirectUrl = createErrorRedirect(request, "profile_fetch_failed", errorDetailsMessage);
      return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
    }

    const profileData = await profileResponse.json() as LinkedInProfileResponse;

    // 7. --- CRITICAL: Implement Session Management ---
    // At this point, authentication with LinkedIn is successful, and you have user profile data.
    // Now, you MUST create a session for your application.
    
    // TODO:
    // 1. Find or create a user in your database based on `profileData.sub` (LinkedIn User ID)
    //    and other relevant profile information (email, name, etc.).
    //    Example: const user = await upsertUserInDB(profileData);
    //
    // 2. Generate a secure session token (e.g., JWT, or an opaque token for a server-side session store).
    //    Example: const sessionToken = await createSessionToken(user.id, { expiresIn: '7d' });
    //
    // 3. Set the session token in an HttpOnly, Secure, SameSite cookie.
    //    Example:
    //    responseHeaders.append(
    //      'Set-Cookie',
    //      `session_id=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}` // Max-Age in seconds
    //    );
    //
    // For now, we'll just log success. REPLACE this with actual session logic.
    console.log("LinkedIn authentication successful. Profile Sub:", profileData.sub, "Email:", profileData.email);


    const successRedirectUrl = createSuccessRedirect(request);
    return NextResponse.redirect(successRedirectUrl.toString(), { headers: responseHeaders });

  } catch (error: any) {
    // General catch-all for unexpected errors during the process
    console.error("OAuth Callback Unhandled Error:", error.message, error.stack, error);
    const redirectUrl = createErrorRedirect(request, "internal_server_error", "An unexpected error occurred during login. Please try again later.");
    return NextResponse.redirect(redirectUrl.toString(), { headers: responseHeaders });
  }
} 