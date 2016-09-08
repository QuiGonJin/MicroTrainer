# Micro Trainer by Kevin Chen

## Synopsis
Micro Trainer is a javascript web application designed to practice or warm up movements commonly used in familiar isometric view video games

## Usage
Can try it here: https://quigonjin.github.io/MicroTrainer/

#### Movement
* The Player is the unit highlighted with a green circle and has a yellow arrow protruding from it
* The yellow arrow indicates the direction the player is currently facing
* Right Mouse button will issue a Move command
* Right Mouse button on a target will issue an attack command on the target. Player will maintain attack aggression and automatically chase targets until the target is changed, destroyed, or the Stop command is issued.
* Alternatively, press 'A' and left click to issue an attack command. A-click will target the unit selected, or the closest unit to the player if no unit is selected
* The 'S' key issues a stop command. The stop command ceases all player movement and attacks.

#### Details
* Translation and Rotation can occur simultaneously
* Player must be facing the target before the attack animation can begin
* The attack animation has 3 phases: The animation prior to projectile launch (let's call it channel time), the projectile launch, and the cooldown animation after projectile launch (let's call it stall time)
* Attack is considered 'successful' and damage calculation will take place immediately once the projectile is launched
* Issuing a Move or Attack command before the channel time ends will cancel the Attack command
* While stalled the player will not be able to Translate automatically, however Rotation and Attacking occur normally
* While stalled the player can manually issue a move command to cancel the stall time
