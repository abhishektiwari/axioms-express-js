# Step-1 Build
Build production version,

```
npm run-script build
```

# Step-2 Publish
Increment version string in `package.json`.
```
npm publish --access public
```

# Optional - Unpublish
Unpublish a given version
```
npm unpublish @axioms/express-js@<version>
```

# Optional - NPM Linking for Local Development
First in the `express-js` root directory run,

```
cd express-js
npm link
```

Then in project root directory

```
cd project
npm link @axioms/express-js
```