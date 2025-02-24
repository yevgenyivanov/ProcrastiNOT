First, run:

``` npm install ```

in the project directory in order to download all dependencies via node.


## RUNNING THE PROJECT ON ANDROID (master branch)
``` npx expo run:android ```

## RUNNING THE PROJECT ON IOS (master branch)
``` npx expo run:ios ```

Please note that in order to run the server you would need to set-up a mongodb atlas account, open a new collection and put your own mongouri under ```config.ts``` in the ```server``` directory.

## RUNNING THE SERVER
``` npx ts-node server.ts ```
