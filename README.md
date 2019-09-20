To build for iphone, execute the following:
```bash
npm run build:ios
cd platforms/ios
xcodebuild -target "IBSAI" -scheme "IBSAI" -configuration Release clean archive
#Go to archive and cp -R IBSAI.app (archive is in   /Users/dido/Library/Developer/Xcode/Archives/  )
# Ex. cp -R /Users/dido/Library/Developer/Xcode/Archives/2019-09-20/IBSAI\ 20.09.19\,\ #8.54.xcarchive/Products/Applications/IBSAI.app ../../IBSAI.app 

sudo xcrun -sdk iphoneos PackageApplication IBSAI.app -o ~/ibs_ai_tester.ipa
```

To build for Android execute:
```bash
npm run build:android
```


You can upload both builds for testin on: https://www.diawi.com/