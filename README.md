# Steam Redeem

Steam Redeem is Chrome, Edge, Firefox and Opera extension that detects Steam keys in a web-page and injects a 'Redeem' button so you can quickly redeem/activate Steam keys in your browser. If you have a page with several Steam keys visible, pressing the Steam Redeem logo next to your address bar will automatically bulk redeem all keys visible on the page.

## Work in Progress

Presently only Humble Bundle is supported and we're missing a lot of useful features, like tracking of previously redeemed keys. Please take a look at my other (Mac only) [Humble Bundle Key Redeemer](https://github.com/Benjamin-Dobell/humble-bundle-key-redeemer) to get an idea of what sort of functionality will be supported. However, in general this solution is already much more robust, and most importantly cross-platform.

## Building the Extension

First you need Node.js and Yarn. Then you can build with:

```
yarn
yarn build
```

the "unpacked" extensions will be built into the `build/` sub-directory.
