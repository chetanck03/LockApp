package com.childapp

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.UserManager
import com.facebook.react.bridge.*
import org.json.JSONArray
import org.json.JSONObject

class DeviceAdminModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val devicePolicyManager: DevicePolicyManager =
        reactContext.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
    
    private val adminComponent: ComponentName =
        ComponentName(reactContext, DeviceAdminReceiver::class.java)

    override fun getName(): String = "DeviceAdminModule"

    @ReactMethod
    fun isDeviceOwner(promise: Promise) {
        try {
            val isOwner = devicePolicyManager.isDeviceOwnerApp(reactApplicationContext.packageName)
            promise.resolve(isOwner)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun lockDevice(promise: Promise) {
        try {
            if (devicePolicyManager.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                devicePolicyManager.lockNow()
                promise.resolve(true)
            } else {
                promise.reject("ERROR", "Not a device owner")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun blockApp(packageName: String, promise: Promise) {
        try {
            if (devicePolicyManager.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                val hidden = devicePolicyManager.setApplicationHidden(adminComponent, packageName, true)
                promise.resolve(hidden)
            } else {
                promise.reject("ERROR", "Not a device owner")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun unblockApp(packageName: String, promise: Promise) {
        try {
            if (devicePolicyManager.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                val visible = devicePolicyManager.setApplicationHidden(adminComponent, packageName, false)
                promise.resolve(!visible)
            } else {
                promise.reject("ERROR", "Not a device owner")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun enableKioskMode(packageName: String, promise: Promise) {
        try {
            if (devicePolicyManager.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                devicePolicyManager.setLockTaskPackages(adminComponent, arrayOf(packageName))
                
                val intent = reactApplicationContext.packageManager.getLaunchIntentForPackage(packageName)
                if (intent != null) {
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    reactApplicationContext.startActivity(intent)
                    currentActivity?.startLockTask()
                }
                promise.resolve(true)
            } else {
                promise.reject("ERROR", "Not a device owner")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun disableKioskMode(promise: Promise) {
        try {
            if (devicePolicyManager.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                currentActivity?.stopLockTask()
                devicePolicyManager.setLockTaskPackages(adminComponent, arrayOf())
                promise.resolve(true)
            } else {
                promise.reject("ERROR", "Not a device owner")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val packageManager = reactApplicationContext.packageManager
            val packages = packageManager.getInstalledApplications(PackageManager.GET_META_DATA)
            
            val appsArray = JSONArray()
            for (app in packages) {
                if (app.flags and ApplicationInfo.FLAG_SYSTEM == 0) {
                    val appInfo = JSONObject()
                    appInfo.put("packageName", app.packageName)
                    appInfo.put("name", packageManager.getApplicationLabel(app).toString())
                    appInfo.put("isBlocked", devicePolicyManager.isApplicationHidden(adminComponent, app.packageName))
                    appsArray.put(appInfo)
                }
            }
            
            promise.resolve(appsArray.toString())
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun setUninstallBlocked(packageName: String, blocked: Boolean, promise: Promise) {
        try {
            if (devicePolicyManager.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                devicePolicyManager.setUninstallBlocked(adminComponent, packageName, blocked)
                promise.resolve(true)
            } else {
                promise.reject("ERROR", "Not a device owner")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun addUserRestriction(restriction: String, promise: Promise) {
        try {
            if (devicePolicyManager.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                devicePolicyManager.addUserRestriction(adminComponent, restriction)
                promise.resolve(true)
            } else {
                promise.reject("ERROR", "Not a device owner")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun clearUserRestriction(restriction: String, promise: Promise) {
        try {
            if (devicePolicyManager.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                devicePolicyManager.clearUserRestriction(adminComponent, restriction)
                promise.resolve(true)
            } else {
                promise.reject("ERROR", "Not a device owner")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}
