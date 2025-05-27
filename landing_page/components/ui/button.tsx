import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import posthog from "posthog-js"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  analyticsLabel?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, children, analyticsLabel, id, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const handleAnalyticsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      let buttonText = analyticsLabel
      
      if (!buttonText) {
        if (typeof children === 'string') {
          buttonText = children;
        } else if (React.isValidElement(children)) {
          // If children is a React element, its props might contain further children.
          const elementProps = children.props as { children?: React.ReactNode }; // Cast to a type that might have children
          if (elementProps && typeof elementProps.children === 'string') {
            buttonText = elementProps.children;
          } else {
            // If props.children is not a string (e.g., it's another element, an array, or undefined)
            buttonText = id || 'N/A';
          }
        } else {
          // If children is not a string and not a single React element (e.g., it's an array of elements, a number, null, etc.)
          buttonText = id || 'N/A';
        }
      }

      posthog.capture("button_click", {
        button_text: buttonText,
        button_id: id,
        button_variant: variant,
        button_size: size,
        button_className: className,
        current_url: typeof window !== "undefined" ? window.location.href : "",
      })

      if (onClick) {
        onClick(event)
      }
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleAnalyticsClick}
        id={id}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
