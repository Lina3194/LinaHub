LinaHub v12 Cloud Edition
=========================

Upload every file and folder in this ZIP to the root of your GitHub repository, replacing the existing LinaHub files.

Cloud features:
- Google sign-in
- Automatic laptop/phone sync
- Offline local saving and Firestore offline cache
- Separate Firestore document per module
- Safe first-device migration from linahub-data
- Manual Upload This Device / Download Cloud Copy controls in Settings

Required Firebase setup (already completed for this project):
- Google Authentication enabled
- Firestore database created
- lina3194.github.io added to Authorized domains
- Rules allow signed-in users to access only users/{uid}/...

First use:
1. Open LinaHub on the device containing the data you want to keep.
2. Go to Settings and sign in with Google.
3. Because the cloud is empty, this device uploads automatically.
4. Open LinaHub on the second device and sign in with the same Google account.
5. Choose Download Cloud Copy if asked.
