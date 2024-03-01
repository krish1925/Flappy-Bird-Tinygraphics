# 3D Flappy Bird
 3D Flappy Bird is a 3D implementation of the classic game flappy bird. It is buit on [tiny-graphics-js](https://github.com/encyclopedia-of-code/tiny-graphics-js), a JavaScript library wraps the WebGL library with addition support of vector and matrix calculation, transformations, key-binding etc.

 In addtion to having the original features of Flappy Bird, we implemented a brand new way to play the game -- instead of sideviewing the bird, you can view it from the back. There's also day time theme and night time theme.

<img src=".github/img/gameplay.png" width="550">
<img src=".github/img/night_theme.png" width="550">
<img src=".github/img/back.png" width="550">

 ## Run
1. Clone or download this repository.
2. Run a fake server by opening host.bat if you're using Windows, or host.command if you're using MacOS. On MacOS, you might get a security warning. If so, open the terminal, navigate to the directory, run `chmod u+x host.command`, and then open host.command again.
3. Open your web browser and navigate to http://localhost:8000/. 

## Controls
The game is controlled by keyboard inputs
- `u` -> go up
- `c` -> change camera angle
- `n` -> start a new game
- `b` -> change day/night theme

the following operation can only be done **before** starting the game
- `g` -> decrease acceleration (min: 5.8, default: 9.8, interval: 2)
- `h` -> increase acceleration (max: 11.8)
- `j` -> decrease initial velocity (min: 4, default: 6, interval: 1)
- `k` -> increase initial velocity (max: 7)

