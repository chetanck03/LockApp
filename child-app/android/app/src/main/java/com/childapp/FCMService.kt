package com.childapp

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import org.json.JSONObject

class FCMService : FirebaseMessagingService() {

    private lateinit var devicePolicyManager: DevicePolicyManager
    private lateinit var adminComponent: ComponentName

    override fun onCreate() {
        super.onCreate()
        devicePolicyManager = getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        adminComponent = ComponentName(this, DeviceAdminReceiver::class.java)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        
        Log.d(TAG, "Message received from: ${remoteMessage.from}")

        remoteMessage.data.let { data ->
            if (data["type"] == "COMMAND") {
                val commandJson = data["command"]
                if (commandJson != null) {
                    handleCommand(JSONObject(commandJson))
                }
            }
        }
    }

    private fun handleCommand(command: JSONObject) {
        try {
            val policyId = command.getString("policyId")
            val type = command.getString("type")
            val payload = command.getJSONObject("payload")

            Log.d(TAG, "Handling command: $type")

            if (!devicePolicyManager.isDeviceOwnerApp(packageName)) {
                Log.e(TAG, "Not a device owner, cannot execute command")
                return
            }

            when (type) {
                "LOCK_DEVICE" -> {
                    devicePolicyManager.lockNow()
                    reportSuccess(policyId, "Device locked")
                }
                "BLOCK_APP" -> {
                    val packageName = payload.getString("packageName")
                    devicePolicyManager.setApplicationHidden(adminComponent, packageName, true)
                    reportSuccess(policyId, "App blocked: $packageName")
                }
                "UNBLOCK_APP" -> {
                    val packageName = payload.getString("packageName")
                    devicePolicyManager.setApplicationHidden(adminComponent, packageName, false)
                    reportSuccess(policyId, "App unblocked: $packageName")
                }
                "ENABLE_KIOSK" -> {
                    val packageName = payload.getString("packageName")
                    devicePolicyManager.setLockTaskPackages(adminComponent, arrayOf(packageName))
                    reportSuccess(policyId, "Kiosk mode enabled")
                }
                "DISABLE_KIOSK" -> {
                    devicePolicyManager.setLockTaskPackages(adminComponent, arrayOf())
                    reportSuccess(policyId, "Kiosk mode disabled")
                }
                "SET_SCREEN_TIME" -> {
                    val minutes = payload.getInt("minutes")
                    // Implement screen time logic
                    reportSuccess(policyId, "Screen time set to $minutes minutes")
                }
                else -> {
                    Log.w(TAG, "Unknown command type: $type")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error handling command", e)
        }
    }

    private fun reportSuccess(policyId: String, message: String) {
        Log.d(TAG, "Command executed: $message")
        // Send status update to backend via API
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "New FCM token: $token")
        
        // Save token to SharedPreferences
        val prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
        prefs.edit().putString(KEY_FCM_TOKEN, token).apply()
        
        // Send token to backend
        sendTokenToBackend(token)
    }

    private fun sendTokenToBackend(token: String) {
        // Implement API call to update FCM token
        Log.d(TAG, "Sending token to backend: $token")
    }

    companion object {
        private const val TAG = "FCMService"
        private const val PREFS_NAME = "ChildAppPrefs"
        private const val KEY_FCM_TOKEN = "fcm_token"
    }
}
