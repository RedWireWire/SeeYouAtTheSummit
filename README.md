﻿# SeeYouAtTheSummit

Un juego de Red Wire Wire, desarrollado por Mario Rabanaque Buil, Andrés Tena De Tena y Aitor Iribar Etxezarreta

# Primera versión de GDD

# Concepto
SeeYouAtTheSummit (o SYATS para abreviar) es un juego diseñado para PC en el que dos jugadores se embarcan en un desafío por descubrir cuál de los dos quedará en pie el último en su periplo de llegar hasta la cima de la montaña interminable. Para ello deberán colocar plataformas a lo largo del camino sobre las que saltar y escalar con el objetivo de no quedarse atrás. Sin embargo, la estrategia juega un importante factor ya que estas plataformas desaparecen bajo ciertas circunstancias, provocando caídas indeseadas y cambios en las estructuras.\
SYATS es un juego que mezcla las mecánicas de movimiento del género de plataformas con la capacidad de construir estructuras con piezas aleatorias que caen del cielo al más puro estilo Tetris. El juego está destinado a todos los públicos, pero sobre todo aquellos que sientan nostalgia por el clásico Tetris encontrarán en SYATS la esencia que les hizo amarlo.\
Para su desarrollo, se empleará el lenguaje de programación JavaScript en el entorno de desarrollo de Phaser. En cuanto a la edición de sonido/música e imágenes, se utilizarán los programas Reaper y Photoshop respectivamente.

![](https://github.com/RedWireWire/SeeYouAtTheSummit/blob/master/Assets/Capturas/1.png)

# Mecánicas de juego
Crear plataformas:\
El campo de juego está dividido con una cuadrícula. Desde la parte superior de la pantalla, caen dos plataformas (una por jugador) inspiradas por el juego clásico "Tetris". Su comportamiento general en cuanto a forma y reglas de movimiento es parecido a este juego. Dependiendo del jugador que la controles, saldrá en la mitad derecha o izquierda (se estudiará en un prototipo la posibilidad de que empiecen siempre en el centro horizontal en vez de en un lado).\
Estas plataformas respetan la cuadrícula. Cada jugador tiene control sobre una de las plataformas que caen. Pueden mover, rotar y acelerar la caída de la misma con las teclas direccionales. También pueden congelar la plataforma en su posición actual con la tecla ENTER, siempre y cuando no esté compartiendo espacio con otra plataforma, un jugador, el suelo u otra entidad.\
Una vez congelada, la plataforma dejará de moverse permanentemente, y sus colisiones serán activadas. Otra plataforma empezará a caer, al control de este mismo jugador. La selección de la siguiente forma de plataforma será pseudo-aleatoria, según un algoritmo procedural todavía por diseñar. Se estudiará en un prototipo la posibilidad de mostrar el siguiente par de formas que caerán al jugador (en vez de no mostrar esta información de ninguna manera).

Destruir plataformas:\
Las plataformas están compuestas por unos cuadrados. Cuando se encuentre un número determinado de cuadrados congelados en secuencia horizontal, dichos cuadrados desaparecerán, dejando caer cualquier entidad que se encuentre sobre ellos. El juego no discrimina en cuanto al jugador que ha colocado estos cuadrados, los trata a todos por igual.\
Se estudiará en un prototipo la posibilidad de que las secuencias verticales también sean destruidas.

Movimiento de jugador:\
Los jugadores controlarán a su personaje mediante las teclas A, D y W. Podrán moverse horizontalmente y saltar. Su movimiento estará regido en parte por la inercia, teniendo cierta aceleración y deceleración. Se mueven en un espacio continuo, no el espacio discreto usado por la creación de plataformas.\
El arco del salto dependerá del tiempo que el jugador mantenga pulsada la tecla W. Una vez se haya comenzado el salto con una fuerza inicial, se seguirá añadiendo cierta cantidad de fuerza (hasta un límite de tiempo) para que el jugador tenga un grado de control sobre la altura y duración del salto. Habrá una fuerza de gravedad constante.\
Los jugadores colisionarán con las plataformas en todas direcciones (no podrán atravesarlas desde abajo), y posiblemente con otras entidades que sean añadidas al juego. No colisionarán entre ellos y no tendrán ninguna manera directa de influenciar al otro personaje.

Cámara:\
La cámara de juego ascenderá a una velocidad constante. Además, tendrá una determinada altura en espacio de pantalla definida. Si un jugador se coloca por encima de esta altura, la cámara ascenderá a una velocidad mayor hasta alcanzar a dicho jugador y haberle colocado por debajo de dicha altura. Una vez haya alcanzado al jugador, volverá a ascender con la velocidad original.\
La superficie del juego que la cámara cubre será siempre constante, es decir, nunca cambiará nivel de zoom.

Condición de fracaso:\
Un jugador pierde la partida en el momento en el que la cámara le deja atrás. En términos técnicos, esto siginifica que el sprite del jugador en su totalidad se ha quedado fuera del frustrum por debajo del mismo.
Cuando esto ocurra, la partida terminará y se reproducirá una pequeña animación final.

Condición de victoria:\
El juego no tiene un objetivo explícito para alcanzar la victoria. Un jugador gana cuando su oponente pierde. Para esto tendrá que dejarle atrás, tanto con un movimiento más veloz y preciso tanto con la creación y destrucción estratégica de plataformas.

# Estados del juego
El juego cuenta con una estructura simple, que le aporta pocos estados. El primero al que accedemos es la portada del juego, en el que observamos un plano general del espacio donde se desarrolla el juego. Al pulsar cualquier tecla pasaremos al Menú Principal, que se muestra al ejecutar el juego. Desde este mismo Menú podremos volver al escritorio o pasar a la sala de matchmaking, donde esperamos hasta encontrar un rival contra el que jugar. Desde el matchmaking se puede volver al Menú principal, pero el paso a la pantalla de juego será automático al encontrar a un rival. Desde la pantalla de juego podemos volver al Menú Principal a través de un botón específico. Cuando un jugador pierda, se pasará a la pantalla de final de partida, y desde esta poddremos volver al Menú Principal, volver a jugar, o buscar otra partida.
![](https://github.com/RedWireWire/SeeYouAtTheSummit/blob/master/Images/DiagramaDeEstados.jpg)

# Personajes
Los personajes que los jugadores controlen serán siempre los mismos (el del Jugador 1 será siempre igual y lo mismo con el Jugador 2). Su diseño será simple y fácilmente diferenciable entre ellos mismos. Basados en figuras "stickman" básicas y de un solo color cada uno.

![](Images/Personajes.png)

# Música
El juego tendrá dos pistas de música diferentes.\
Menú principal: Una pista tranquila, de instrumentación escasa. Poco más que un instrumento melódico con ataque pronunciado y no demasiado sustain. Esto se combinará con el soundscape relajado de la montaña.\
Gameplay: Durante la animación de inicio de la partida, no habrá música. En el momento en el que comienza la partida, comenzará una pista extremadamente contrastante con la música del menú. Se tratará de una pista intrumental divertida, con mucha sincopación, y un elevado número de instrumentos que se irán turnando para hacer de voz principal. El género al que más se acerca es el funk.

# Sonido
En el menú principal y durante la secuencia de inicio de la partida, se creará un soundscape poco cargado. Estará dominado por el sonido del viento, con puntuales sonidos de aves en la distancia. Este soundscape desaparecerá una vez comience el gameplay, siendo sustituido por la música.\
Cada acción de los jugadores tendrá sonidos cortos y satisfactorios asociados. Saltar, aterrizar, caminar, mover plataformas, colocarlas, y destruirlas.

# Interfaz

Se realizará una interfaz para cada una de las pantallas, todas las interfaces siguen un estilo similar, los botones que compongan esta interfaz tendrán un estilo cuadriculado, además de que se utilizará una misma gama de colores muy vivos(la cual será una gama entorno al morado) para todas.
Todas las pantallas contarán con el mismo fondo el cual será una animación de la montaña que deberán escalar los jugadores.

Menú principal:\
La interfaz del menú principal estará compuesta por un botón "Match" en el centro de la pantalla. En la zona superior izquierda se encontrará el botón de ajustes (para modificar distintos parámetros como brillo, contraste, sonido...).

![Menú principal](https://github.com/RedWireWire/SeeYouAtTheSummit/blob/master/Interfaces/Interfaz.png)

Pantalla de matchmaking:\
Será una pantalla de espera que saldrá cuando el jugador principal quiera buscar una partida, esta durará el tiempo que tarde en encontrar a un rival. Durante la búsqueda aparecerá un símbolo de carga en el centro.

![](https://github.com/RedWireWire/SeeYouAtTheSummit/blob/master/Interfaces/Interfaz-matchmaking.png)

Pantalla de juego:\
En cuanto a la interfaz de la pantalla de juego constará de un menú desplegable en el que hay diferentes opciones como volver al menú principal, salir del juego... Una sección de la pantalla irá dedicada a ver cuáles van a ser las siguientes piezas que se dropearán para el jugador, para que estos sean conscientes de qué piezas van a poder utilizar.

Pantalla fin de juego:\
Esta pantalla surge cuando la partida termina es decir cuando uno de los dos jugadores cae. En esta pantalla se encontrarán 4 botones, situados en el centro de la pantalla ordenados de forma vertical: el primero para jugar otra partida de revancha, uno para buscar otra partida, otro para salir del juego y uno para volver al menú principal.
![](https://github.com/RedWireWire/SeeYouAtTheSummit/blob/master/Interfaces/Interfaz-pantalla-victoria.png)
![](https://github.com/RedWireWire/SeeYouAtTheSummit/blob/master/Interfaces/Interfaz-pantalla-derrota.png)
