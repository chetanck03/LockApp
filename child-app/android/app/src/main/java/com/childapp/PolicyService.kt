package com.childapp

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log
import kotlinx.coroutines.*
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject

class PolicyService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var isRunning = false

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "PolicyService created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (!isRunning) {
            isRunning = true
            startPolling()
        }
        return START_STICKY
    }

    private fun startPolling() {
        serviceScope.launch {
            while (isRunning) {
                try {
                    checkForCommands()
                } catch (e: Exception) {
                    Log.e(TAG, "Error checking commands", e)
                }
                delay(30000) // Poll every 30 seconds
            }
        }
    }

    private suspend fun checkForCommands() {
        withContext(Dispatchers.IO) {
            try {
                val deviceId = getDeviceId()
                val token = getAuthToken()
                
                if (deviceId.isEmpty() || token.isEmpty()) {
                    Log.w(TAG, "Device not registered")
                    return@withContext
                }

                val url = URL("${API_BASE_URL}/devices/${deviceId}/status")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.setRequestProperty("Authorization", "Bearer $token")
                connection.connectTimeout = 10000
                connection.readTimeout = 10000

                val responseCode = connection.responseCode
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    val response = connection.inputStream.bufferedReader().readText()
                    val jsonResponse = JSONObject(response)
                    
                    // Process pending policies
                    if (jsonResponse.has("policies")) {
                        val policies = jsonResponse.getJSONArray("policies")
                        for (i in 0 until policies.length()) {
                            val policy = policies.getJSONObject(i)
                            if (policy.getString("status") == "sent") {
                                executePolicy(policy)
                            }
                        }
                    }
                }
                
                connection.disconnect()
            } catch (e: Exception) {
                Log.e(TAG, "Error in checkForCommands", e)
            }
        }
    }

    private fun executePolicy(policy: JSONObject) {
        try {
            val policyId = policy.getString("id")
            val policyType = policy.getString("policy_type")
            val payload = policy.getJSONObject("payload")

            Log.d(TAG, "Executing policy: $policyType")

            // Execute policy based on type
            // This would call DeviceAdminModule methods
            
            // Report execution status
            reportPolicyStatus(policyId, "executed", JSONObject().apply {
                put("success", true)
                put("timestamp", System.currentTimeMillis())
            })
        } catch (e: Exception) {
            Log.e(TAG, "Error executing policy", e)
        }
    }

    private suspend fun reportPolicyStatus(policyId: String, status: String, result: JSONObject) {
        withContext(Dispatchers.IO) {
            try {
                val token = getAuthToken()
                val url = URL("${API_BASE_URL}/policies/${policyId}/status")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "PUT"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.setRequestProperty("Authorization", "Bearer $token")
                connection.doOutput = true

                val requestBody = JSONObject().apply {
                    put("status", status)
                    put("result", result)
                }

                connection.outputStream.write(requestBody.toString().toByteArray())
                connection.responseCode // Trigger request
                connection.disconnect()
            } catch (e: Exception) {
                Log.e(TAG, "Error reporting policy status", e)
            }
        }
    }

    private fun getDeviceId(): String {
        val prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
        return prefs.getString(KEY_DEVICE_ID, "") ?: ""
    }

    private fun getAuthToken(): String {
        val prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
        return prefs.getString(KEY_AUTH_TOKEN, "") ?: ""
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        serviceScope.cancel()
        Log.d(TAG, "PolicyService destroyed")
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        private const val TAG = "PolicyService"
        private const val API_BASE_URL = "https://your-backend-url.com"
        private const val PREFS_NAME = "ChildAppPrefs"
        private const val KEY_DEVICE_ID = "device_id"
        private const val KEY_AUTH_TOKEN = "auth_token"
    }
}
