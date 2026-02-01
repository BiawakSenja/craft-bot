# craft-bot
# CraftsDev Auto Bot

An automated bot for interacting with the CraftsDev platform on Solana. This bot automatically upvotes, reviews, and comments on crafts to earn points.

## Features

- 🔐 Automatic wallet authentication using Solana private keys
- ⬆️ Auto upvote crafts
- ⭐ Auto create reviews with random titles and content
- 💬 Auto post comments
- 📊 Display score breakdown (votes, reviews, comments)
- 🔄 Continuous operation with configurable cycles
- 👥 Multi-wallet support

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Solana wallet private key(s)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/vikitoshi/CraftsDev-Auto-Bot.git
cd CraftsDev-Auto-Bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
touch .env
```

4. Add your Solana private key(s) to the `.env` file:
```env
PRIVATE_KEY_1=your_first_private_key_here
PRIVATE_KEY_2=your_second_private_key_here
PRIVATE_KEY_3=your_third_private_key_here
```

You can add as many wallets as you want by following the pattern `PRIVATE_KEY_1`, `PRIVATE_KEY_2`, etc.

## Usage

Run the bot:
```bash
node index.js
```

## Dependencies

- `axios` - HTTP client for API requests
- `tweetnacl` - Cryptographic signing
- `base-58` - Base58 encoding/decoding
- `dotenv` - Environment variable management

## Security Notes

⚠️ **Important Security Information:**

- Never share your private keys
- Keep your `.env` file secure and never commit it to version control
- The `.env` file is already included in `.gitignore`
- Use at your own risk - automated bots may violate platform terms of service

## Troubleshooting

### "No private keys found in .env file"
- Make sure your `.env` file exists in the root directory
- Verify that your private keys follow the naming pattern: `PRIVATE_KEY_1`, `PRIVATE_KEY_2`, etc.

### "Session expired or invalid"
- The bot will automatically attempt to re-login
- If issues persist, verify your private keys are correct

### API Errors
- Check your internet connection
- Verify the CraftsDev platform is accessible
- The bot includes automatic retry logic for authentication

## Disclaimer

This bot is for educational purposes only. Use at your own risk. The authors are not responsible for any consequences resulting from the use of this software. Make sure to comply with the CraftsDev platform's terms of service.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Repository

GitHub: [https://github.com/vikitoshi/CraftsDev-Auto-Bot](https://github.com/vikitoshi/CraftsDev-Auto-Bot)

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

---

**Note**: Always ensure you're complying with the platform's terms of service when using automation tools.
