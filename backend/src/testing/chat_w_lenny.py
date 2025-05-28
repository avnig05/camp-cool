from src.config.utils import init_lenny


def main():
    lenny = init_lenny()
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Exiting chat. Goodbye!")
            break

        response = lenny.send_msg(user_input)
        print(f"Lenny: {response}")


if __name__ == "__main__":
    main()
