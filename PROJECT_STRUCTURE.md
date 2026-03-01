# Parental Control System - Project Structure

```
parental-control-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── firebase.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── devices.js
│   │   │   └── policies.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── deviceController.js
│   │   │   └── policyController.js
│   │   ├── services/
│   │   │   ├── fcmService.js
│   │   │   └── commandService.js
│   │   └── index.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── parent-app/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   ├── DashboardScreen.js
│   │   │   ├── DeviceDetailScreen.js
│   │   │   └── AppsListScreen.js
│   │   ├── components/
│   │   │   ├── DeviceCard.js
│   │   │   ├── AppItem.js
│   │   │   └── CommandButton.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── auth.js
│   │   │   └── storage.js
│   │   ├── navigation/
│   │   │   └── AppNavigator.js
│   │   └── store/
│   │       ├── authStore.js
│   │       └── deviceStore.js
│   ├── android/
│   ├── ios/
│   ├── App.js
│   ├── package.json
│   └── .env.example
└── child-app/
    ├── android/
    │   ├── app/
    │   │   ├── src/
    │   │   │   └── main/
    │   │   │       ├── java/com/childapp/
    │   │   │       │   ├── MainActivity.kt
    │   │   │       │   ├── DeviceAdminModule.kt
    │   │   │       │   ├── DeviceAdminReceiver.kt
    │   │   │       │   ├── DeviceAdminPackage.kt
    │   │   │       │   ├── PolicyService.kt
    │   │   │       │   └── FCMService.kt
    │   │   │       ├── res/
    │   │   │       │   └── xml/
    │   │   │       │       └── device_admin.xml
    │   │   │       └── AndroidManifest.xml
    │   │   └── build.gradle
    │   └── build.gradle
    ├── src/
    │   ├── screens/
    │   │   └── HomeScreen.js
    │   └── services/
    │       └── api.js
    ├── App.js
    ├── package.json
    └── provisioning.json
```
