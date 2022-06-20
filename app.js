
//Constantes para definir parámetros del juego.
const WIDTH = 500;
const HEIGHT = 400;
const [INICIO, PLAY, FINAL] = [0, 1, 2];
const TEMPLATE_LADRILLOS = [15,10,7]; //Tenerlo así permite regular la dificultad con filas de distinto numero de ladrillos.
const SIZEY_LADRILLO = 20;
const [SIZEX_PALA, SIZEY_PALA] = [60, 20];
const VEL_PALA = 0.03;
const VEL_BOLA = 6;

//Variables globales del estado de la aplicación
var canvas;
var estadoJuego = INICIO;
var inicializado = false; //Variable auxiliar para inicializar las pantallas;
var victoria = false;
var pala;
var ladrillos = [];

var to_left = false;
var to_right = false;

var boton_jugar;
var boton_reintentar;

function setup(){
    canvas = createCanvas(WIDTH,HEIGHT);
    canvas.parent("canvas-container");
    background(200,100,100);
    frameRate(30);
    estadoJuego = INICIO;
}

function draw(){
    
    switch(estadoJuego){
        
        case INICIO:
            if(!inicializado){
                dibujaInicio();
            }
            break;
        case PLAY:
            dibujaJuego();
            break;
        case FINAL:
            if(!inicializado){
                dibujaFinal();
            }
            break;


    }

}

function iniciarJuego(){
    estadoJuego = PLAY;
    inicializarLadrillos();
    pala = new Pala(350,SIZEX_PALA,SIZEY_PALA);

    inicializado = false;
    
    if(typeof(boton_jugar)!='undefined'){
        boton_jugar.hide();
    }
    if(typeof(boton_reintentar)!='undefined'){
        boton_reintentar.hide()
    }
    bola = new Bola();
}

function dibujaFinal(){
    background(125);
    textFont('monospace');
    textSize(50);
    textAlign('center');
    let mensaje = victoria ? "VICTORIA" : "DERROTA";
    text(mensaje,WIDTH/2,200);
    
    if(typeof(boton_reintentar) == 'undefined'){
        boton_reintentar = createButton('Volver a jugar');
        boton_reintentar.parent("canvas-container");
        boton_reintentar.position(WIDTH/2,300);
        boton_reintentar.mousePressed(iniciarJuego);
    }
    else{
        boton_reintentar.show();
    }

    inicializado = true;
}

function dibujaInicio(){
    textFont('monospace');
    textSize(50);
    textAlign('center');
    text('Arkanoid',WIDTH/2,200);

    if(typeof(boton_jugar) == 'undefined'){
        boton_jugar = createButton('Jugar');
        boton_jugar.parent("canvas-container");
        boton_jugar.position(WIDTH/2,300);
        boton_jugar.mousePressed(iniciarJuego);
    }
    else{
        boton_reintentar.show();
    }
    inicializado = true;
}

function dibujaJuego(){
    //Pintamos el fondo, los ladrillos, actualizamos y pintamos la pala y ejecutamos el main de la bola
    background(125);
    actualizarLadrillos();
    pala.control();
    pala.display();
    bola.main();
}

function inicializarLadrillos(){
    //Rellena el array de ladrillos usando el template definido para saber cuantas filas tiene y de cuantos ladrillos.
    //Por cada valor en el array de templante crea una fila con ese número de ladrillos
    ladrillos = [];
    TEMPLATE_LADRILLOS.forEach((n_ladrillos,current_row)=>{
        let sizeX = WIDTH/n_ladrillos;
        let posY = current_row * SIZEY_LADRILLO + SIZEY_LADRILLO/2;
        for(let n=0; n<n_ladrillos; n++){
            
            let posX = sizeX*n + sizeX/2;            
            ladrillos.push(new Ladrillo(posX,posY,sizeX,SIZEY_LADRILLO));
        }
    });
}

function actualizarLadrillos(){
    //Pinta todos los ladrillos en juego
    ladrillos.forEach((ladrillo)=>ladrillo.display());
}

class Ladrillo{
    constructor(posX,posY,sizeX=20,sizeY=10){
        this.posX = posX;
        this.posY = posY;
        this.sizeX = sizeX;
        this.sizeY = sizeY;

        this.shape = this.display();

    }
    display(){
        fill('red');
        let shape = rect(this.posX-this.sizeX/2,this.posY-this.sizeY/2,this.sizeX,this.sizeY);
        return shape;
    }
    get x(){
        return this.posX;
    }
    get y(){
        return this.posY;
    }
    get xy(){
        return (this.posX,this.posY);
    }
}

class Pala{
    constructor(posY,sizeX=30,sizeY=20){
        this._posX = 0;
        this.posY = posY; 
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        
        this.shape = this.display();
    }

    ws_pos(){
        //Por comodidad, la posición almacenada en _posX es relativa al ancho del canvas, 
        // así que esta función devuelve la posición en el espacio del mundo para calculos en los que se requiera.
        let ws_x = map(this.posX,-1, 1, this.sizeX/2, WIDTH-this.sizeX/2);
        let ws_y = this.posY;

        return [ws_x, ws_y];
    }
    get posX(){
        return this._posX;
    }
    set posX(value){
        this._posX = constrain(value,-1,1);
    }

    move(velocity){
        this.posX += velocity;
    }

    display(){
        // Lee la posición absoluta de la pala y la pinta
        let [posX, posY] = this.ws_pos();
        translate(-this.sizeX/2, -this.sizeY/2);
        fill('white');
        let shape = rect(posX, posY, this.sizeX, this.sizeY);
        resetMatrix();
        return shape;
    }

    control(){
        //Si está una de las teclas (derecha o izquierda) pulsada y la otra no, mueve la pala en la
        // dirección pulsada, si no, no se mueve.
        let dir = to_right && !to_left? 1 : to_left && !to_right? -1 : 0;
        this.move(dir*VEL_PALA);

    }

}

//Lectura de inputs
function keyPressed(){
    switch(keyCode){
        //tecla de la izquierda
        case 37:
            to_left = true;
            break;
        //tecla de la derecha
        case 39:
            to_right = true;
            break;
    }
}

//Lectura inputs soltados
function keyReleased(){   
    switch(keyCode){
        //tecla de la izquierda soltada
        case 37:
            to_left = false;
            break;
        //tecla de la derecha soltada
        case 39:
            to_right = false;
            break;
    }
}

class Bola{
    constructor(size=20){
        this.size = size;
        this.col_size = 3/4 *size;
        this._posX = WIDTH/2;
        this._posY = HEIGHT/2;
        this._vel = createVector(0.5,0.5).mult(VEL_BOLA);
    }

    get posX(){
        return this._posX;
    }
    set posX(value){
        this._posX = value;
    }
    get posY(){
        return this._posY;
    }
    set posY(value){
        this._posY = value;
    }
    get vel(){
        return this._vel;
    }
    set vel(value){
        this._vel = value;
    }

    main(){
        this.detectaChoque();
        this.mover();
        this.display();
    }

    display(){
        fill('white');
        ellipse(this.posX,this.posY,this.size,this.size);
    }

    cambiarDir(dir){
        dir = dir.normalize();
        this.vel = dir.mult(VEL_BOLA)
    }

    mover(){
        this.posX += this.vel.x;
        this.posY += this.vel.y;
    }

    detectaChoque(){
        let [x_pala, y_pala ] = pala.ws_pos();
        let centro_pala = createVector(x_pala,y_pala);
        let bola_coords = createVector(this.posX,this.posY);

        let [min_x_bola, max_x_bola] = [this.posX - this.col_size/2, this.posX + this.col_size/2];
        let [min_y_bola, max_y_bola] = [this.posY - this.col_size/2, this.posY + this.col_size/2];

        let [min_x_pala, max_x_pala] = [x_pala - pala.sizeX/2, x_pala + pala.sizeX/2];
        let [min_y_pala, max_y_pala] = [y_pala- pala.sizeY/2, y_pala + pala.sizeY/2];

        let new_dir_y;
        let new_dir_x;

        //Comprobar colisiones con bola
        if(this.comprobarInterseccionRangos(min_y_bola,max_y_bola,min_y_pala,max_y_pala)){
            if(this.comprobarInterseccionRangos(min_x_bola,max_x_bola,min_x_pala,max_x_pala)){
                //Calcular el rebote en función de la posición que ocupa la bola respecto de la pala.
                new_dir_y = map(this.posY,min_y_pala,max_y_pala,-1,1);
                new_dir_x = map(this.posX,min_x_pala,max_x_pala,-1,1);

                this.cambiarDir(createVector(new_dir_x,new_dir_y));
            }
        }

        //Comprobar colisiones con bordes:
        //Si choca contra el borde inferior se acaba el juego con derrota
        if(this.comprobarInterseccionRangos(min_y_bola,max_y_bola,HEIGHT,HEIGHT)){
            this.acabarJuego(false);
            this.vel = createVector(0,0);
            return;
        }
        //Si choca contra el borde superior se invierte la dirección en y
        if(this.comprobarInterseccionRangos(min_y_bola,max_y_bola,0,0)){
            this.cambiarDir(this.vel.mult(1,-1));
            this.posY=constrain(this.posY,this.size/2,HEIGHT-this.size/2); //Esto asegura que la bola se mantenga en el canvas
        }
        //Si choca contra los bordes laterales se invierte la dirección en x
        if(this.comprobarInterseccionRangos(min_x_bola,max_x_bola,0,0) || this.comprobarInterseccionRangos(min_x_bola,max_x_bola,WIDTH,WIDTH)){
            this.cambiarDir(this.vel.mult(-1,1));
            this.posX=constrain(this.posX,this.size/2,WIDTH-this.size/2); //Esto asegura que la bola se mantenga en el canvas
        }
        
        //Comprobar colisiones con ladrillos
        ladrillos.forEach((ladrillo, indice_ladrillo)=>{
            let [min_x_ladrillo, max_x_ladrillo] = [ladrillo.posX - ladrillo.sizeX/2, ladrillo.posX + ladrillo.sizeX/2];
            let [min_y_ladrillo, max_y_ladrillo] = [ladrillo.posY - ladrillo.sizeY/2, ladrillo.posY + ladrillo.sizeY/2];
          	//Comprobamos si están intersectando las dimensiones en el eje vertical y en horizontal. Si coinciden en ambos es
          	//que ha chocado con ese ladrillo y por tanto hay que cambiar la bola de dirección y destruir el ladrillo.
            if(this.comprobarInterseccionRangos(min_y_bola,max_y_bola,min_y_ladrillo,max_y_ladrillo)){
                if(this.comprobarInterseccionRangos(min_x_bola,max_x_bola,min_x_ladrillo,max_x_ladrillo)){
                    //Calcular el rebote en función de la posición que ocupa la bola respecto del ladrillo con el que choca.
                    new_dir_y = map(this.posY,min_y_ladrillo,max_y_ladrillo,-1,1);
                    new_dir_x = map(this.posX,min_x_ladrillo,max_x_ladrillo,-1,1);
    
                    this.cambiarDir(createVector(new_dir_x,new_dir_y));
                    ladrillos.splice(indice_ladrillo,1);
                    if(ladrillos.length==0){
                        this.acabarJuego(true);
                    }
                }
            }
        });   
    }
    

    acabarJuego(ganar = false){
        victoria = ganar;
        estadoJuego = FINAL;
    }
	
  	/*
    Podría haber simulado las colisiones de muchas maneras, pero he pensado que sería
  	habría sido más preciso por ejemplo calcular si un numero mayor de puntos de la circunferencia
    estan dentro de los rectángulos. Con 6 o 8 puntos de la circunferencia se tendría un calculo bastante preciso
    de las colisiones de la circunferencia, aunque he creído suficiente utilizar un cuadrado ligeramente inferior
    al diámetro de la pelota y reducir los cálculos a comparación de dos rangos. De forma que,
    si las dimensiones de este cuadrado de colisión se encuentran en x e y dentro de las dimensiones de
    x e y de las dimensiones del elemento con el que las comparamos, obtenemos que están chocando.
    */
    comprobarInterseccionRangos(minRango1,maxRango1,minRango2,maxRango2){
      	//Esta función compara un rango de una dimensión contra otro y devuelve si ambos intersectan.
        let minEnRango = minRango1 < maxRango2 && minRango1 > minRango2? true : false;
        let maxEnRango = maxRango1 < maxRango2 && maxRango1 > minRango2? true : false;
        let minBajoRango = minRango1 < minRango2;
        let maxSobreRango = maxRango1 > maxRango2;
        return minEnRango || maxEnRango || (minBajoRango && maxSobreRango);
    }

}