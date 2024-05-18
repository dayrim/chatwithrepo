# chatwithrepo

Chat with your repositories with the power of Gemini!

## About

Chatwithrepo is a platform that allows users to chat with their repositories. It uses Gemini to provide intelligent responses.

## Deploy

You will need to have docker and docker-compose installed on your server.

1. Copy the `.env.example` file to `.env`
2. Update environment variables in `.env`.
3. Login to Docker Registry:
   ```
   docker login -u <REGISTRY_USERNAME> -p <REGISTRY_PASSWORD> <REGISTRY_URL>
   ```
4. Run the following commands:
   ```
   docker-compose pull
   docker-compose up -d
   docker-compose ps
   ```

## Development

1. Clone this repository:
   ```
   git clone https://github.com/dayrim/chatwithrepo.git
   ```
2. Run the following commands from the root of the project:
   ```
   yarn
   yarn dev
   ```

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework for building the web interface.
- [Feathers](https://feathersjs.com/) - Node.js framework for building the backend API.
- [Gemini](https://developers.generativeai.google/) - Google's large language model for generating text responses.
- [Docker](https://www.docker.com/) - Containerization platform for easy deployment.
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for styling the web interface.
- [Flowbite](https://flowbite.com/) - Component library for building the web interface.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
