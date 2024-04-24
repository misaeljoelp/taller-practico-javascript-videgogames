/**
 * @type {HTMLCanvasElement}
 */ //Accediendo al DOM mediante queryselector
const canvas = document.querySelector('#game')
const btnUp = document.querySelector('#up')
const btnDown = document.querySelector('#down')
const btnLeft = document.querySelector('#left')
const btnRight = document.querySelector('#right')
const btnPlay = document.querySelector('#jugar')
const btnSalir = document.querySelector('#salir')
const spanVidas = document.querySelector('#vidas')
const spanTiempo = document.querySelector('#tiempo')
const spanRecord = document.querySelector('#record')
const optBeginer = document.querySelector('#beginer')
const optAficionado = document.querySelector('#aficionado')
const optProfesional = document.querySelector('#profesional')
const btnResetearRecord = document.querySelector('#reset')

// Variables usadas
const game = canvas.getContext('2d')
let canvasSize, elementSize //tamaño del canvas y tamaño de cada pequeña parte del canvas
let level = 0 //nivel del juego que corresponde a cada registro de maps
let lives = 3 //número de vidas que tiene un jugador
let mapa      // es la representación de un nivel en un array bidimensional
let movimiento = "" // identificador del tipo de movimiento que hago: arriba, abajo, izq, derecha y me sirve para borrar el jugador en su posición anterior en cada movimiento
let timeStart // es el valor inicial del contador de tiempo
let timeInterval // permite mostrar el avance del tiempo
let tiempoTotal=0 // variable que a cada instante captura el tiempo y permite capturar el tiempo final que logro hacer el jugador
let estoyJugando = false // sirve para el funcionamiento del boton Play y habilitar o deshabilitar los botones o teclas de movimiento al inicio y al reinicio
let nivelJugador // permite manejar las características del jugador: beginer, aficionado, profesional

const positions = {//en este objeto guardo la posición del jugador en cada momento y las posiciones iniciales y finales de cada nivel
    playerX: undefined,
    playerY: undefined,
    inicioX: undefined,
    inicioY: undefined,
    finX: undefined,
    finY: undefined,
}

window.addEventListener('load', setCanvasSize)
window.addEventListener('resize', setCanvasSize)
window.addEventListener('keydown', moveByKeys)
btnUp.addEventListener('click', moveUp)
btnDown.addEventListener('click', moveDown)
btnLeft.addEventListener('click', moveLeft)
btnRight.addEventListener('click', moveRight)
btnPlay.addEventListener('click', play)
optBeginer.addEventListener('click', seleccionarBeginer)
optAficionado.addEventListener('click', seleccionarAficionado)
optProfesional.addEventListener('click', seleccionarProfesional)
btnResetearRecord.addEventListener('click', resetear)


/* mapa = convertirStringToArray(maps[level])  */
tipoNivelJuego()
spanTiempo.innerHTML = formatoTiempo(0)
function startGame() {//muestra en pantalla lo que hay en el mapa bidimensional a cada instante, también gráfica movimientos del jugador y cambio de tamaño de pantalla cada vez que esta función es llamada luego de dichos cambios.
    spanVidas.innerHTML = ''
    mostrarVidas()
    mostrarRecord()
    game.font = `${elementSize}px times`
    game.textBaseline = 'top'
    game.clearRect(0,0,canvasSize, canvasSize)
    mapa.forEach((row, rowI) => {
        row.forEach((col,colI) => {
            const emoji = emojis[col]
            const posX = elementSize * colI
            const posY = elementSize * rowI
            if(col == 'O' && positions.playerX === undefined){
                positions.playerX = rowI
                positions.playerY = colI
                positions.inicioX = rowI
                positions.inicioY = colI
            }
            if(col == 'I'){
                positions.finX = rowI
                positions.finY = colI

            }
            game.fillText(emoji, posX, posY)
            
        })
    });
}

function setCanvasSize() {//establece el tamaño de la pantalla y de cada pequeña parte de la pantalla según tipo de jugador
    if (window.innerWidth > window.innerHeight)
        canvasSize = window.innerHeight * 0.7
    else
        canvasSize = window.innerWidth * 0.7
//Me aseguro de trabajar con números enteros
if (nivelJugador === 'profesional'){
    elementSize = canvasSize / 20
    elementSize = Math.floor(elementSize)
    canvasSize = elementSize * 20
    console.log('set canvas profesional')
}
if (nivelJugador === 'aficionado'){
    elementSize = canvasSize / 10
    elementSize = Math.floor(elementSize)
    canvasSize = elementSize * 10
    console.log('set canvas profesional')
}
if (nivelJugador === 'beginer'){
    elementSize = canvasSize / 6
    elementSize = Math.floor(elementSize)
    canvasSize = elementSize * 6
}

    canvas.setAttribute('width', canvasSize)
    canvas.setAttribute('height', canvasSize)

    startGame()
}
function play() {//movimiento inicial del juego y reinicio por pérdida de vidas o fin del juego.
    if (btnPlay.innerHTML == 'REINICIAR'){
            level = 0
            lives=3
            timeStart = undefined
            mapa = convertirStringToArray(maps[level]) 
            positions.playerX = undefined
            nivelJugador = 'beginer'
            tipoNivelJuego()
            btnPlay.innerHTML = 'Play'
    } else
    if (mapa){
        mapa[positions.playerX][positions.playerY] = 'PLAYER'
        console.log(timeStart)
        estoyJugando = true
        cambiarColorBotones() 
        if (!timeStart) {
            console.log('inicio')
            timeStart = Date.now()
            timeInterval = setInterval(mostrarTiempo,200)
        }
        startGame()
    }
}
function convertirStringToArray(mapa) { // se recibe el mapa en un string y se lo pasa a array bidimensional
    const mapRows = mapa.trim().split('\n')
    const mapCols = mapRows.map((item)=>item.trim().split(''))
    return mapCols
}
//funciones de movimiento arriba, abajo, izquierda, derecha
function moveUp() {
    if(estoyJugando){
        if (positions.playerX > 0){
            positions.playerX -= 1
            movimiento = 'up'
            evaluatePlayerMovement(movimiento)
            }
    }

    }

function moveDown() {
    if(estoyJugando){
        if (positions.playerX < mapa.length-1){
            positions.playerX += 1
            movimiento = 'down'
            evaluatePlayerMovement(movimiento)
            }
    }
}
function moveLeft() {
    if(estoyJugando){
        if (positions.playerY > 0){
            positions.playerY -= 1
            movimiento = 'left'
            evaluatePlayerMovement(movimiento)
            }
    }
}
function moveRight() {
    if(estoyJugando){
        if (positions.playerY < mapa.length-1){
            positions.playerY += 1
            movimiento = 'right'
            evaluatePlayerMovement(movimiento)
            }
    }
}
function moveByKeys(event) {//movimiento mediante las teclas de flechas
    if(event.key == 'ArrowUp') moveUp()
    if(event.key == 'ArrowDown') moveDown()
    if(event.key == 'ArrowLeft') moveLeft()
    if(event.key == 'ArrowRight') moveRight()
}
function gameWin() {//procedimiento a realizar  cuando se gana
    game.clearRect(0,0,canvasSize, canvasSize)
    game.font = elementSize/2 +'px impact'
    evaluarRecord()
    btnPlay.innerHTML = 'REINICIAR'
    estoyJugando = false
    cambiarColorBotones()
    /* finalScreen.classList.toggle('screen') */
}
function evaluarRecord() {//establece el record inicial, o el que logre en cada juego, o lo que se tenga que hacer sino se logra un record
    let recordActual = Number(localStorage.getItem('record_time'))
    if (!recordActual){
        recordActual = tiempoTotal
        localStorage.setItem('record_time', tiempoTotal)
        game.font = '30px impact'
        game.fillText('INCREIBLE ERES EL PRIMERO',150, 60)
        game.font = '150px impact'
        game.fillText('🏆',130, 100)
        game.font = '30px impact'
        game.fillText('DESEAS REINICIAR?',150, 380)
    } else if (tiempoTotal < recordActual){
        recordActual = tiempoTotal
        localStorage.setItem('record_time', tiempoTotal)
        game.font = '30px impact'
        game.fillText('LO HICISTE DE NUEVO!!!!!',150, 60)
        game.font = '150px impact'
        game.fillText('🏆🥇🥈🥉',130, 100)
        game.font = '30px impact'
        game.fillText('DESEAS REINICIAR?',150, 380)
    } else{
        game.font = '30px impact'
        game.fillText('NO TE DESANIMES!!',150, 60)
        game.font = '150px impact'
        game.fillText('🏃‍♂️',130, 100)
        game.font = '30px impact'
        game.fillText('DESEAS REINICIAR?',150, 380)
    }

}
function gameFail() {//procedimiento cuando se pierden las tres vidas
    estoyJugando = false
    cambiarColorBotones()
    btnPlay.innerHTML= 'REINICIAR'
    game.clearRect(0,0,canvasSize, canvasSize)
    game.font = '30px impact'
    game.fillText('LO HACES BIEN',150, 60)
    game.font = '150px impact'
    game.fillText('🙈',130, 100)
    game.font = '30px impact'
    game.fillText('DESEAS REINICIAR?',150, 380)
}

//A cada movimiento se evalua si cae en bombas, si llega a un nivel superior, si llega al último nivel, si vuelve a su posición de inicio o si va por buen camino
function evaluatePlayerMovement(move) {//evalua si cae en un lugar prohibido una o mas veces
    if (mapa[positions.playerX][positions.playerY] == 'X' || mapa[positions.playerX][positions.playerY] == 'BOMB_COLLISION') {
        mapa[positions.playerX][positions.playerY] = 'BOMB_COLLISION'
        asignaMovimiento(move)
        positions.playerX = positions.inicioX
        positions.playerY = positions.inicioY
        mapa[positions.playerX][positions.playerY] = 'PLAYER'
        lives -= 1
        /* console.log(lives) */
        if (lives === 0){
            gameFail()
            clearInterval(timeInterval)
            return
        }

    } else if (mapa[positions.playerX][positions.playerY] == 'I'){ //si llega a un cambio de nivel
            level++
            
            if (level < maps.length){ //llega a un nivel superior
                tipoNivelJuego()
                mapa = convertirStringToArray(maps[level])
                positions.playerX = undefined
                startGame()
                play()

            }
            else{ // supera el último nivel
                mapa = undefined
                clearInterval(timeInterval)
                gameWin()
            }
            return
        
            } else if (mapa[positions.playerX][positions.playerY] == 'O'){ //regresa al inicio
                        mapa[positions.playerX][positions.playerY] = 'PLAYER'
                        asignaMovimiento(move)
                    }
                    else {
                        mapa[positions.playerX][positions.playerY] = 'PLAYER'
                        asignaMovimiento(move)
                        mapa[positions.inicioX][positions.inicioY] = 'O'
                        mapa[positions.finX][positions.finY] = 'I'
                    }
                    startGame()
}

function asignaMovimiento(move) {// esta función es auxiliar de evaluar movimientos y permite borrar al jugador en su posición anterior colocando un espacio en blanco
    if (move === 'up') {
        mapa[positions.playerX+1][positions.playerY] = '-'
    }
    if (move === 'down') {
        mapa[positions.playerX-1][positions.playerY] = '-'
    }
    if (move === 'left') {
        mapa[positions.playerX][positions.playerY+1] = '-'
    }
    if (move === 'right') {
        mapa[positions.playerX][positions.playerY-1] = '-'
    }
}

function mostrarVidas() {
    for (let i = 0; i < lives; i++) {
        spanVidas.innerHTML += emojis['BALL']
    }
}
function mostrarRecord() {
    spanRecord.innerHTML = formatoTiempo(localStorage.getItem('record_time'))
}
function mostrarTiempo() {
    spanTiempo.innerHTML = formatoTiempo(Date.now() - timeStart)
}
function formatoTiempo(tiempo) {
    tiempoTotal = tiempo
    const ms = tiempo % 1000
    let seg = (tiempo - ms) / 1000
    let tempo = seg
    seg = seg % 60
    let min = (tempo - seg) / 60
    tempo = min
    min = min % 60
    let hora = (tempo - min) / 60
    return `${colocarCeros(hora)}: ${colocarCeros(min)}: ${colocarCeros(seg)}: ${ms}`
}
function colocarCeros(valor) {
    if(valor< 10)
    return '0'+ valor
    else 
    return valor
}
function cambiarColorBotones() {
    if (estoyJugando){
        btnDown.style.backgroundColor = '#4FC3F7'
        btnUp.style.backgroundColor = '#4FC3F7'
        btnRight.style.backgroundColor = '#4FC3F7'
        btnLeft.style.backgroundColor = '#4FC3F7'
    } else{
        btnDown.style.backgroundColor = '#bbc52d'
        btnUp.style.backgroundColor = '#bbc52d'
        btnRight.style.backgroundColor = '#bbc52d'
        btnLeft.style.backgroundColor = '#bbc52d'
    }
}
function tipoNivelJuego() {
    if (document.getElementById('beginer').checked || (level >= 0 && level <= 1)){
      nivelJugador = 'beginer'
      document.body.style.backgroundColor = 'indigo';
      optBeginer.checked = true;
    }
    if (document.getElementById('aficionado').checked || (level >= 2 && level <= 4)){
       nivelJugador = 'aficionado'
       document.body.style.backgroundColor = 'red';
       optAficionado.checked = true;
    }
    if (document.getElementById('profesional').checked || level > 4){
       nivelJugador = 'profesional'
       document.body.style.backgroundColor = 'black';
       optProfesional.checked = true;
    }
    
    mapa = convertirStringToArray(maps[level]) 
    positions.playerX = undefined
    setCanvasSize()
}

function seleccionarBeginer() {
    level = 0
    tipoNivelJuego()
    timeStart = undefined
    if (btnPlay.innerHTML == 'REINICIAR'){
        lives=3
        btnPlay.innerHTML = 'Play'
    }
}
function seleccionarAficionado() {
    level = 2
    tipoNivelJuego()
    timeStart = undefined
    if (btnPlay.innerHTML == 'REINICIAR'){
        lives=3
        btnPlay.innerHTML = 'Play'
    }
}
function seleccionarProfesional() {
    level = 5
    tipoNivelJuego()
    timeStart = undefined
    if (btnPlay.innerHTML == 'REINICIAR'){
        lives=3
        btnPlay.innerHTML = 'Play'
    }
}
function resetear() {
    let respuesta = prompt('Esta seguro: SI, NO',)
    if (respuesta.toUpperCase() == 'SI') {
        localStorage.setItem('record_time',0)
        mostrarRecord()
    }
}