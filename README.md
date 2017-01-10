# ettg-markov

## Installation

    npm install

## Usage

## Configuration
The following environment variables are supported:
```bash
# Twitter API keys (required)
export TWIT_CONSUMER_KEY={your_consumer_key}
export TWIT_CONSUMER_SECRET={your_consumer_secret}
export TWIT_ACCESS_TOKEN={your_access_token}
export TWIT_ACCESS_TOKEN_SECRET={your_access_token_secret}

# Parameters to Markov generator (optional)
# see https://github.com/substack/node-markov/
export MARKOV_ORDER=2
export MARKOV_LIMIT=20
```

## License
MIT

### TODO
forget this markov shit, the results are disappointing
just split sentences at obvious boundaries and combine using grammar
