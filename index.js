const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const offset = {
  x: -740,
  y: -615
}

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, i + 70))
}

const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i += 70) {
  battleZonesMap.push(battleZonesData.slice(i, i + 70))
}

const boundaries = []
collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol) {
      boundaries.push(new Boundary({
        position: {
          x: j * Boundary.width + offset.x,
          y: i * Boundary.height + offset.y
        }
      }))
    }
  })
})

const battleZones = []
battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol) {
      battleZones.push(new Boundary({
        position: {
          x: j * Boundary.width + offset.x,
          y: i * Boundary.height + offset.y
        }
      }))
    }
  })
})

const mapImage = new Image()
mapImage.src = './images/pelletTown.png'

const playerImageDown = new Image()
playerImageDown.src = './images/playerDown.png'

const playerImageUp = new Image()
playerImageUp.src = './images/playerUp.png'

const playerImageLeft = new Image()
playerImageLeft.src = './images/playerLeft.png'

const playerImageRight = new Image()
playerImageRight.src = './images/playerRight.png'

const foregroundImage = new Image()
foregroundImage.src = './images/foreground.png'

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: mapImage
})

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: foregroundImage
})

const player = new Sprite({
  position: {
    x: canvas.width / 2 - (192 / 4) / 2,
    y: canvas.height / 2 - 68 / 2
  },
  image: playerImageDown,
  frames: {
    max: 4
  },
  sprites: {
    up: playerImageUp,
    down: playerImageDown,
    left: playerImageLeft,
    right: playerImageRight
  }
})

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}

const movables = [background, ...boundaries, foreground, ...battleZones]

function rectangularCollision({rect1, rect2}) {
  return (
    rect1.position.x + rect1.width >= rect2.position.x &&
    rect1.position.x <= rect2.position.x + rect2.width &&
    rect1.position.y <= rect2.position.y + rect2.height &&
    rect1.position.y + rect1.height >= rect2.position.y
  )
}

function checkForBoundaryCollision({xChange = 0, yChange = 0}) {
  for (let i = 0; i < boundaries.length; ++i) {
    const boundary = boundaries[i]
    if (
      rectangularCollision({
        rect1: player,
        rect2: {...boundary, position:{
          x: boundary.position.x + xChange,
          y: boundary.position.y + yChange
        }}
      })
    ) {
      return true
    }
  }

  return false
}

function checkForBattleInit(animationId) {
  for (let i = 0; i < battleZones.length; ++i) {
    const battleZone = battleZones[i]
    const overlappingArea = (
      Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) -
      Math.max(player.position.x, battleZone.position.x)
    ) *
    (
      Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) -
      Math.max(player.position.y, battleZone.position.y)
    )

    if (
      rectangularCollision({
        rect1: player,
        rect2: battleZone
      }) &&
      overlappingArea > player.width * player.height / 4 &&
      player.position.y + player.height <= battleZone.position.y + battleZone.height &&
      Math.random() < 0.03
    ) {
      window.cancelAnimationFrame(animationId)

      gsap.to('#overlappingDiv', {
        opacity: 1,
        repeat: 3,
        yoyo: true,
        duration: 0.4,
        onComplete() {
          gsap.to('#overlappingDiv', {
            opacity: 1,
            duration: 0.4,
            onComplete() {
              animateBattle()
              gsap.to('#overlappingDiv', {
                opacity: 0,
                duration: 0.4
              })
            }
          })
        }
      })
      return true
    }
  }

  return false
}

let battle = {
  initiated: false
}

function animate() {
  const animationId = window.requestAnimationFrame(animate)
  background.draw()
  boundaries.forEach(boundary => boundary.draw())
  battleZones.forEach(battleZone => battleZone.draw())
  player.draw()
  foreground.draw()

  let colliding = true
  player.moving = false

  console.log(animationId)

  if (battle.initiated) return

  if (keys.w.pressed) {
    player.moving = true
    player.image = player.sprites.up
    colliding = checkForBoundaryCollision({yChange: 3})
    battle.initiated = checkForBattleInit(animationId)

    if (!colliding) movables.forEach(movable => movable.position.y += 3)
  }

  if (keys.s.pressed) {
    player.moving = true
    player.image = player.sprites.down
    colliding = checkForBoundaryCollision({yChange: -3})
    battle.initiated = checkForBattleInit(animationId)

    if (!colliding) movables.forEach(movable => movable.position.y -= 3)
  }

  if (keys.a.pressed) {
    player.moving = true
    player.image = player.sprites.left
    colliding = checkForBoundaryCollision({xChange: 3})
    battle.initiated = checkForBattleInit(animationId)

    if (!colliding) movables.forEach(movable => movable.position.x += 3)
  }

  if (keys.d.pressed) {
    player.moving = true
    player.image = player.sprites.right
    colliding = checkForBoundaryCollision({xChange: -3})
    battle.initiated = checkForBattleInit(animationId)

    if (!colliding) movables.forEach(movable => movable.position.x -= 3)
  }
}

const battleBackgroundImage = new Image()
battleBackgroundImage.src = './images/battleBackground.png'

const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  image: battleBackgroundImage
})
function animateBattle() {
  const battleAnimationId = window.requestAnimationFrame(animateBattle)
  battleBackground.draw()


}

//animate()
animateBattle()

window.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'w':
      keys.w.pressed = true
      break

    case 'a':
      keys.a.pressed = true
      break

    case 's':
      keys.s.pressed = true
      break

    case 'd':
      keys.d.pressed = true
      break
  }
})

window.addEventListener('keyup', (e) => {
  switch(e.key) {
    case 'w':
      keys.w.pressed = false
      break

    case 'a':
      keys.a.pressed = false
      break

    case 's':
      keys.s.pressed = false
      break

    case 'd':
      keys.d.pressed = false
      break
  }
})
