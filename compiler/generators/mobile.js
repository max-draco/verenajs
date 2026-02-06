/**
 * verenajs Mobile Generator
 * Generates mobile bundles for iOS and Android via Capacitor
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Mobile Generator Class
 */
class MobileGenerator {
  constructor(config) {
    this.config = config;
    this.platform = config.mobile?.platform || 'both';
  }

  /**
   * Generate mobile bundle
   */
  async generate(ast, analysis) {
    const outputs = [];

    // Generate web bundle first (Capacitor uses web assets)
    const webBundle = await this.generateWebBundle(ast, analysis);
    outputs.push(webBundle);

    // Generate native bridges
    const bridges = this.generateNativeBridges(analysis);
    outputs.push(bridges);

    // Generate Capacitor config
    const capacitorConfig = this.generateCapacitorConfig();
    outputs.push(capacitorConfig);

    // Generate platform-specific code
    if (this.platform === 'ios' || this.platform === 'both') {
      const iosConfig = this.generateIOSConfig();
      outputs.push(iosConfig);
    }

    if (this.platform === 'android' || this.platform === 'both') {
      const androidConfig = this.generateAndroidConfig();
      outputs.push(androidConfig);
    }

    // Write outputs
    await this.writeOutputs(outputs);

    return {
      platform: this.platform,
      size: outputs.reduce((sum, o) => sum + (o.code?.length || 0), 0)
    };
  }

  /**
   * Generate web bundle for Capacitor
   */
  async generateWebBundle(ast, analysis) {
    // Similar to web generator but with mobile optimizations
    const code = `
// verenajs Mobile Bundle
(function() {
  'use strict';

  // Platform detection
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  var isAndroid = /Android/.test(navigator.userAgent);

  // Capacitor bridge
  var Capacitor = window.Capacitor || {};

  // Native API bridges
  window.__verena_native = {
    // Device info
    getDeviceInfo: function() {
      if (Capacitor.Plugins && Capacitor.Plugins.Device) {
        return Capacitor.Plugins.Device.getInfo();
      }
      return Promise.resolve({ platform: 'web' });
    },

    // Camera
    takePhoto: function(options) {
      if (Capacitor.Plugins && Capacitor.Plugins.Camera) {
        return Capacitor.Plugins.Camera.getPhoto(options);
      }
      return Promise.reject(new Error('Camera not available'));
    },

    // Geolocation
    getCurrentPosition: function(options) {
      if (Capacitor.Plugins && Capacitor.Plugins.Geolocation) {
        return Capacitor.Plugins.Geolocation.getCurrentPosition(options);
      }
      return new Promise(function(resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    },

    // Haptics
    vibrate: function(duration) {
      if (Capacitor.Plugins && Capacitor.Plugins.Haptics) {
        return Capacitor.Plugins.Haptics.vibrate({ duration: duration });
      }
      if (navigator.vibrate) {
        navigator.vibrate(duration);
      }
    },

    // Local notifications
    scheduleNotification: function(options) {
      if (Capacitor.Plugins && Capacitor.Plugins.LocalNotifications) {
        return Capacitor.Plugins.LocalNotifications.schedule({ notifications: [options] });
      }
      return Promise.reject(new Error('Notifications not available'));
    },

    // Storage
    storage: {
      get: function(key) {
        if (Capacitor.Plugins && Capacitor.Plugins.Storage) {
          return Capacitor.Plugins.Storage.get({ key: key }).then(function(r) { return r.value; });
        }
        return Promise.resolve(localStorage.getItem(key));
      },
      set: function(key, value) {
        if (Capacitor.Plugins && Capacitor.Plugins.Storage) {
          return Capacitor.Plugins.Storage.set({ key: key, value: value });
        }
        localStorage.setItem(key, value);
        return Promise.resolve();
      },
      remove: function(key) {
        if (Capacitor.Plugins && Capacitor.Plugins.Storage) {
          return Capacitor.Plugins.Storage.remove({ key: key });
        }
        localStorage.removeItem(key);
        return Promise.resolve();
      }
    },

    // Status bar
    setStatusBarStyle: function(style) {
      if (Capacitor.Plugins && Capacitor.Plugins.StatusBar) {
        return Capacitor.Plugins.StatusBar.setStyle({ style: style });
      }
    },

    // Keyboard
    hideKeyboard: function() {
      if (Capacitor.Plugins && Capacitor.Plugins.Keyboard) {
        return Capacitor.Plugins.Keyboard.hide();
      }
    },

    // App state
    onAppStateChange: function(callback) {
      if (Capacitor.Plugins && Capacitor.Plugins.App) {
        Capacitor.Plugins.App.addListener('appStateChange', callback);
      }
    },

    // Back button (Android)
    onBackButton: function(callback) {
      if (Capacitor.Plugins && Capacitor.Plugins.App) {
        Capacitor.Plugins.App.addListener('backButton', callback);
      }
    }
  };

  // Mobile-specific touch optimizations
  document.addEventListener('touchstart', function() {}, { passive: true });

  // Prevent pull-to-refresh on iOS
  document.body.addEventListener('touchmove', function(e) {
    if (e.target === document.body) {
      e.preventDefault();
    }
  }, { passive: false });

  // Safe area insets
  function getSafeAreaInsets() {
    var style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('--sat') || '0'),
      right: parseInt(style.getPropertyValue('--sar') || '0'),
      bottom: parseInt(style.getPropertyValue('--sab') || '0'),
      left: parseInt(style.getPropertyValue('--sal') || '0')
    };
  }

  window.__verena_native.getSafeAreaInsets = getSafeAreaInsets;

})();
`;

    return {
      name: 'mobile-bundle',
      filename: 'mobile.js',
      code
    };
  }

  /**
   * Generate native bridges
   */
  generateNativeBridges(analysis) {
    const code = `
// verenajs Native Bridges
// Custom Capacitor plugins for verenajs features

// ZeroMQ Bridge Plugin
var ZMQBridge = {
  connect: function(options) {
    return Capacitor.nativePromise('ZMQBridge', 'connect', options);
  },
  subscribe: function(topic) {
    return Capacitor.nativePromise('ZMQBridge', 'subscribe', { topic: topic });
  },
  publish: function(topic, data) {
    return Capacitor.nativePromise('ZMQBridge', 'publish', { topic: topic, data: data });
  },
  disconnect: function() {
    return Capacitor.nativePromise('ZMQBridge', 'disconnect', {});
  }
};

// OpenCV Bridge Plugin
var OpenCVBridge = {
  processImage: function(options) {
    return Capacitor.nativePromise('OpenCVBridge', 'processImage', options);
  },
  detectContours: function(imageData) {
    return Capacitor.nativePromise('OpenCVBridge', 'detectContours', { imageData: imageData });
  },
  recognizeHandwriting: function(imageData) {
    return Capacitor.nativePromise('OpenCVBridge', 'recognizeHandwriting', { imageData: imageData });
  }
};

// Export bridges
window.__verena_bridges = {
  zmq: ZMQBridge,
  opencv: OpenCVBridge
};
`;

    return {
      name: 'native-bridges',
      filename: 'bridges.js',
      code
    };
  }

  /**
   * Generate Capacitor configuration
   */
  generateCapacitorConfig() {
    const config = {
      appId: this.config.appId || 'com.verenajs.app',
      appName: this.config.appName || 'verenajs App',
      webDir: 'dist',
      bundledWebRuntime: false,
      plugins: {
        SplashScreen: {
          launchShowDuration: 2000,
          backgroundColor: '#1e293b'
        },
        StatusBar: {
          style: 'dark',
          backgroundColor: '#1e293b'
        },
        Keyboard: {
          resize: 'body',
          resizeOnFullScreen: true
        }
      },
      server: {
        androidScheme: 'https'
      }
    };

    return {
      name: 'capacitor-config',
      filename: 'capacitor.config.json',
      code: JSON.stringify(config, null, 2)
    };
  }

  /**
   * Generate iOS configuration
   */
  generateIOSConfig() {
    const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleDisplayName</key>
  <string>${this.config.appName || 'verenajs App'}</string>
  <key>CFBundleExecutable</key>
  <string>$(EXECUTABLE_NAME)</string>
  <key>CFBundleIdentifier</key>
  <string>${this.config.appId || 'com.verenajs.app'}</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>$(PRODUCT_NAME)</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>1.0</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>LSRequiresIPhoneOS</key>
  <true/>
  <key>UILaunchStoryboardName</key>
  <string>LaunchScreen</string>
  <key>UIMainStoryboardFile</key>
  <string>Main</string>
  <key>UIRequiredDeviceCapabilities</key>
  <array>
    <string>armv7</string>
  </array>
  <key>UISupportedInterfaceOrientations</key>
  <array>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
  </array>
  <key>UIViewControllerBasedStatusBarAppearance</key>
  <true/>
  <key>NSCameraUsageDescription</key>
  <string>This app uses the camera for taking photos.</string>
  <key>NSLocationWhenInUseUsageDescription</key>
  <string>This app uses your location.</string>
</dict>
</plist>`;

    return {
      name: 'ios-config',
      filename: 'ios/App/App/Info.plist',
      code: plist
    };
  }

  /**
   * Generate Android configuration
   */
  generateAndroidConfig() {
    const manifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${this.config.appId || 'com.verenajs.app'}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:exported="true"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBarLaunch">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>
</manifest>`;

    return {
      name: 'android-config',
      filename: 'android/app/src/main/AndroidManifest.xml',
      code: manifest
    };
  }

  /**
   * Write outputs to disk
   */
  async writeOutputs(outputs) {
    const outDir = path.join(this.config.output.dir, 'mobile');

    await fs.promises.mkdir(outDir, { recursive: true });

    for (const output of outputs) {
      const filePath = path.join(outDir, output.filename);
      const dir = path.dirname(filePath);

      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.writeFile(filePath, output.code);
    }
  }
}

export { MobileGenerator };
export default MobileGenerator;
