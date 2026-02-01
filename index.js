require('dotenv').config();
const axios = require('axios');
const nacl = require('tweetnacl');
const base58 = require('base-58');

const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  white: "\x1b[37m",
  bold: "\x1b[1m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

const logger = {
  info: (msg) => console.log(`${colors.white}[✓] ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}[⚠] ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}[✗] ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}[✅] ${msg}${colors.reset}`),
  loading: (msg) => console.log(`${colors.cyan}[→] ${msg}${colors.reset}`),
  countdown: (msg) => process.stdout.write(`\r${colors.yellow}[⏰] ${msg}${colors.reset}`),
  banner: () => {
    console.log(`${colors.cyan}${colors.bold}`);
    console.log(`--------------------------------------`);
    console.log(` CraftsDev Auto Bot - Airdrop Insiders   `);
    console.log(`--------------------------------------${colors.reset}`);
  },
};

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
];

const REVIEW_TITLES = [
  "Great project!",
  "Amazing innovation",
  "Love this concept",
  "Impressive work",
  "Nice product",
  "Excellent idea",
  "Revolutionary approach",
  "Promising project",
  "Solid execution",
  "Outstanding effort"
];

const REVIEW_CONTENTS = [
  "This is a great product with innovative features",
  "Really impressed by the implementation and vision",
  "This project has huge potential in the ecosystem",
  "Love the attention to detail and user experience",
  "The team is doing amazing work on this",
  "This is exactly what the Solana ecosystem needs",
  "Great use case and practical application",
  "The technology behind this is very promising",
  "This could be a game changer for the industry",
  "Excited to see where this project goes"
];

const COMMENTS = [
  "Great work!",
  "Love this!",
  "Amazing project",
  "Keep building!",
  "This is awesome",
  "Impressive!",
  "Nice!",
  "Brilliant",
  "Fantastic",
  "Well done",
  "solid team, perfect visions",
  "Bullish on the concept",
  "Looking forward to seeing how this develops",
  "Impressive execution so far",
  "Solid team behind this one"
];

class CraftsDevBot {
  constructor(privateKey) {
    this.privateKey = privateKey;
    this.publicKey = null;
    this.sessionToken = null;
    this.userId = null;
    this.userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  }

  getKeyPair() {
    const secretKey = base58.decode(this.privateKey);
    const keyPair = nacl.sign.keyPair.fromSecretKey(secretKey);
    this.publicKey = base58.encode(keyPair.publicKey);
    return keyPair;
  }

  async getNonce() {
    try {
      const response = await axios.get(
        `https://crafts.dev/api/auth/siws/nonce?publicKey=${this.publicKey}`,
        {
          headers: {
            'User-Agent': this.userAgent,
            'accept': '*/*'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get nonce: ${error.message}`);
    }
  }

  signMessage(message, keyPair) {
    const messageBytes = new TextEncoder().encode(message);
    const signature = nacl.sign.detached(messageBytes, keyPair.secretKey);
    return base58.encode(signature);
  }

  async signIn() {
    try {
      const keyPair = this.getKeyPair();
      const nonceData = await this.getNonce();
      const signature = this.signMessage(nonceData.message, keyPair);

      const signInResponse = await axios.post(
        'https://crafts.dev/api/auth/siws/sign-in',
        {
          publicKey: this.publicKey,
          signature: signature,
          message: nonceData.message
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': this.userAgent,
            'accept': '*/*'
          }
        }
      );

      this.userId = signInResponse.data.user.id;
      this.username = signInResponse.data.user.username;
      
      const setCookie = signInResponse.headers['set-cookie'];
      if (setCookie && setCookie.length > 0) {
        for (const cookie of setCookie) {
          const match = cookie.match(/better-auth\.session_token=([^;]+)/);
          if (match) {
            const fullToken = match[1];
            this.cookieHeader = `better-auth.session_token=${fullToken}`;
            logger.success(`Logged in as ${this.username || this.publicKey.substring(0, 8)}`);
            logger.info(`Token: ${fullToken.substring(0, 30)}...`);
            return true;
          }
        }
      }
      
      const plainToken = signInResponse.data.session.token;
      this.cookieHeader = `better-auth.session_token=${plainToken}`;
      logger.success(`Logged in as ${this.username || this.publicKey.substring(0, 8)}`);
      logger.warn('No Set-Cookie found, using plain token');
      return true;
    } catch (error) {
      logger.error(`Sign in failed: ${error.message}`);
      return false;
    }
  }

  async getSession() {
    try {
      const response = await axios.get(
        'https://crafts.dev/api/auth/get-session',
        {
          headers: {
            'User-Agent': this.userAgent,
            'accept': '*/*',
            'Cookie': `better-auth.session_token=${this.sessionToken}`
          }
        }
      );
      if (response.data && response.data.session) {
        this.sessionToken = response.data.session.token;
        return response.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async getRandomCrafts(limit = 7) {
    try {
      const response = await axios.get(
        `https://crafts.dev/api/trpc/craft.getRandomCrafts?input=${encodeURIComponent(JSON.stringify({ json: { limit } }))}`,
        {
          headers: {
            'User-Agent': this.userAgent,
            'accept': '*/*',
            'Cookie': this.cookieHeader
          }
        }
      );
      return response.data.result.data.json;
    } catch (error) {
      logger.error(`Failed to get random crafts: ${error.message}`);
      return [];
    }
  }

  async upvote(craftId) {
    try {
      logger.info(`Attempting upvote ...`);
      
      const response = await axios.post(
        'https://crafts.dev/api/trpc/interaction.toggleVote',
        { json: { craftId } },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': this.userAgent,
            'accept': '*/*',
            'Cookie': this.cookieHeader,
            'Referer': 'https://crafts.dev/discover',
            'Origin': 'https://crafts.dev'
          }
        }
      );
      return response.data.result.data.json.voted;
    } catch (error) {
      if (error.response) {
        logger.error(`Upvote failed: ${error.response.status} - ${error.response.statusText}`);
        if (error.response.status === 401) {
          logger.warn('Session expired or invalid. Attempting re-login...');
          await this.signIn();
        }
      } else {
        logger.error(`Upvote failed: ${error.message}`);
      }
      return false;
    }
  }

  async createReview(craftId) {
    try {
      const title = REVIEW_TITLES[Math.floor(Math.random() * REVIEW_TITLES.length)];
      const content = REVIEW_CONTENTS[Math.floor(Math.random() * REVIEW_CONTENTS.length)];
      const rating = 5;

      const response = await axios.post(
        'https://crafts.dev/api/trpc/interaction.createReview',
        {
          json: {
            craftId,
            rating,
            title,
            content
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': this.userAgent,
            'accept': '*/*',
            'Cookie': this.cookieHeader,
            'Referer': `https://crafts.dev/crafts/${craftId}`,
            'Origin': 'https://crafts.dev'
          }
        }
      );
      return response.data.result.data.json;
    } catch (error) {
      logger.error(`Review failed: ${error.message}`);
      return null;
    }
  }

  async createComment(craftId) {
    try {
      const content = COMMENTS[Math.floor(Math.random() * COMMENTS.length)];

      const response = await axios.post(
        'https://crafts.dev/api/trpc/interaction.createComment',
        {
          json: {
            craftId,
            content
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': this.userAgent,
            'accept': '*/*',
            'Cookie': this.cookieHeader,
            'Referer': `https://crafts.dev/crafts/${craftId}`,
            'Origin': 'https://crafts.dev'
          }
        }
      );
      return response.data.result.data.json;
    } catch (error) {
      logger.error(`Comment failed: ${error.message}`);
      return null;
    }
  }

  async getScore() {
    try {
      const response = await axios.get(
        'https://crafts.dev/api/trpc/user.calculateScore?input=%7B%22json%22%3Anull%2C%22meta%22%3A%7B%22values%22%3A%5B%22undefined%22%5D%7D%7D',
        {
          headers: {
            'User-Agent': this.userAgent,
            'accept': '*/*',
            'Cookie': this.cookieHeader
          }
        }
      );
      return response.data.result.data.json;
    } catch (error) {
      logger.error(`Failed to get score: ${error.message}`);
      return null;
    }
  }

  async runCycle() {
    logger.info(`Starting cycle for ${this.publicKey.substring(0, 8)}...`);
    
    const crafts = await this.getRandomCrafts(5);
    
    if (crafts.length === 0) {
      logger.warn('No crafts found');
      return;
    }

    for (let i = 0; i < crafts.length; i++) {
      const craft = crafts[i];
      logger.loading(`Processing ${i + 1}/${crafts.length}: ${craft.name}`);

      const voted = await this.upvote(craft.id);
      if (voted) {
        logger.success(`✓ Upvoted: ${craft.name}`);
      }
      await this.delay(2000);

      const review = await this.createReview(craft.id);
      if (review) {
        logger.success(`✓ Reviewed: ${craft.name}`);
      }
      await this.delay(2000);

      const comment = await this.createComment(craft.id);
      if (comment) {
        logger.success(`✓ Commented on: ${craft.name}`);
      }
      
      await this.delay(2000);
    }

    const score = await this.getScore();
    if (score) {
      logger.info(`-----------------------------------`);
      logger.info(`📊 Total Score: ${colors.green}${score.totalScore}${colors.reset}`);
      logger.info(`👍 Votes: ${score.breakdown.votes.count} (${score.breakdown.votes.points} pts)`);
      logger.info(`⭐ Reviews: ${score.breakdown.reviews.count} (${score.breakdown.reviews.points} pts)`);
      logger.info(`💬 Comments: ${score.breakdown.comments.count} (${score.breakdown.comments.points} pts)`);
      logger.info(`-----------------------------------`);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

async function countdown(seconds) {
  for (let i = seconds; i > 0; i--) {
    logger.countdown(`Next cycle in ${i} seconds...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log();
}

async function main() {
  logger.banner();

  const privateKeys = [];
  let i = 1;
  while (process.env[`PRIVATE_KEY_${i}`]) {
    privateKeys.push(process.env[`PRIVATE_KEY_${i}`]);
    i++;
  }

  if (privateKeys.length === 0) {
    logger.error('No private keys found in .env file');
    process.exit(1);
  }

  logger.info(`Found ${privateKeys.length} wallet(s)`);

  const bots = [];
  for (const pk of privateKeys) {
    const bot = new CraftsDevBot(pk);
    const success = await bot.signIn();
    if (success) {
      bots.push(bot);
    }
    await bot.delay(2000);
  }

  if (bots.length === 0) {
    process.exit(1);
  }

  while (true) {
    for (const bot of bots) {
      await bot.runCycle();
      await bot.delay(3000);
    }
    
    logger.success('Cycle completed for all wallets');
    await countdown(20);
  }
}

main().catch(error => {
  logger.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
