from src.model.Instructed_Gemini import Lenny


def main():
    lenny = Lenny()
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Exiting chat. Goodbye!")
            break

        response = lenny.send_msg(user_input)
        print(f"Lenny: {response}")


if __name__ == "__main__":
    main()
