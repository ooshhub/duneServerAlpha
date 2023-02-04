### Dune Server Alpha

#### Currently includes:
- /interface : dev UI for server control/logging/debugging/rapid restart (can move to another repo if still useful after dev)
- /server : core Dune game

#### Setup
package.json commands:    
- *build:server*    typescript compile    
- *watch:server*    typescript compile and watch changes
- *dev:server*      directly launch compiled server code from terminal (not really useful now that UI is built)

- *package:server*  package server to executable (currently uses pkg build tool)

- *dev:ui*          launch vite server for server dev UI
- *neu:ui*          launch neutralino server for server dev UI (run after dev:ui)

- *build:ui*        build server UI
- *package:ui*      package server UI for dist (run after build:ui)
