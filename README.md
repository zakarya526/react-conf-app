# Conference App for React Conf 2025


## Features

### AI-Powered Assistant

The app includes an AI-powered assistant feature that helps attendees navigate the conference, answer questions about sessions, speakers, and schedule information. The assistant is powered by Google's Gemini 2.5 Flash model, providing real-time conversational support throughout the conference experience.

**Key capabilities:**
- Answer questions about conference sessions, speakers, and schedules
- Provide real-time assistance and information
- Help navigate the conference app features
- Conversational interface powered by Google Gemini AI

The AI assistant is integrated seamlessly into the app and can be accessed from the main navigation. It uses the `@google/genai` SDK to communicate with the Gemini API, providing a smooth and responsive chat experience.

## Installation

To run the app locally, clone the repo and install dependencies with [Bun](https://bun.sh/) `bun install`. Next, either [compile and run it locally](#compile-and-run-locally) or [build and run it with EAS](#build-and-run-with-eas).

## Compile and run locally

To compile the app locally, you will need to have Xcode ([learn more](https://docs.expo.dev/guides/local-app-development/#ios)) and/or Android ([learn more](https://docs.expo.dev/guides/local-app-development/#android)) toolchains installed and configured.

> [!NOTE]
> In order to be able to sign the app for an iOS device with a development certificate, you need a unique bundle identifier. Change the `APP_ID_PREFIX` in **app.config.ts** to a unique ID, such as `yourname.reactconf`. Run `npx expo prebuild --clean` when you've updated the value to sync it to the native project.

### Android

```sh
# Generate the `android/` directory
npx expo prebuild -p android

# Compile with Gradle
npx expo run:android

# Alternatively, start the dev server and manually open in Android Studio and build
npx expo start
```

### iOS

```sh
# Generate the `ios/` directory
npx expo prebuild -p ios

# Compile with xcodebuild and run on simulator.
npx expo run:ios

# Alternatively, start the dev server and manually open Xcode and build
npx expo start
```

For development on the Android Emulator / iOS Simulator:

## Build and run with EAS

### Initial configuration

In order to run a build with EAS, you will need to update the EAS owner and project ID fields in **app.config.ts**. Change the `EAS_APP_OWNER`, `EAS_PROJECT_ID`, and `EAS_UPDATE_URL` to empty strings, then run `eas init` and `eas update:configure` to get the new values for your username (never used EAS before? [look at this guide](https://docs.expo.dev/build/setup/)).

### Android

```sh
# Create a development build. When it's completed, you will be prompted to install it
eas build --platform android --profile localdev

# Create a preview build. This is like a production build, but intended to be
# installed directly to your device
eas build --platform android --profile preview
```

### iOS

```sh
# Create a development build. When it's completed, you will be prompted to install it
eas build --platform ios --profile localdev

# Create a preview build. This is like a production build, but intended to be
# installed directly to your device
eas build --platform ios --profile preview
```

## Environment Variables

To enable the AI-powered assistant feature, you'll need to configure the Gemini API key:

1. Create a `.env` file in the root directory
2. Add your Gemini API key: (i've hard coded it 😊, if not working then use your api kay from google studio, which offers a lot in Free Trail)
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. The API key will be automatically loaded from `process.env.GEMINI_API_KEY` in the app configuration

## Learn more

- [Get started with Expo](https://docs.expo.dev/get-started/introduction/).
- Check out the [Expo "Getting Started" tutorial](https://docs.expo.dev/tutorial/introduction/).
- Check out the [EAS Tutorial](https://docs.expo.dev/tutorial/eas/introduction/) or the [EggHead course](https://egghead.io/courses/build-and-deploy-react-native-apps-with-expo-eas-85ab521e).
