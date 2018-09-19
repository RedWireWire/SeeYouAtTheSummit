# SeeYouAtTheSummit

Un juego de Red Wire Wire, desarrollado por Mario RabanaqueBuil, Andrés Tena De Tena y Aitor Iribar Etxezarreta

# Mecánicas de juego
Crear plataformas:\
El campo de juego está dividido con una cuadrícula. Desde la parte superior de la pantalla, caen dos plataformas (una por jugador) inspiradas por el juego clásico "Tetris". Su comportamiento general en cuanto a forma y reglas movimiento es parecido a este juego.
Estas plataformas respetan la cuadrícula. Cada jugador tiene control sobre una de las plataformas que caen. Pueden mover, rotar y acelerar la caída la misma con las teclas direccionales. También pueden congelar la plataforma en su posición actual con la tecla ENTER, siempre y cuando no esté compartiendo espacio con otra plataforma, un jugador, el suelo u otra entidad.\
Una vez congelada, la plataforma dejará de moverse permanentemente, y sus colisiones serán activadas. Otra plataforma empezará a caer, al control de este mismo jugador. La selección de la siguiente forma de plataforma será pseudo-aleatoria, según un algoritmo procedural todavía por diseñar.

Destruir plataformas:\
Las plataformas están compuestas por unos cuadrados. Cuando se encuentre un número determinado de cuadrados congelados en secuencia horizontal, dichos cuadrados desaparecerán, dejando caer cualquier entidad que se encuentre sobre ellos. El juego no discrimina en cuanto al jugador que ha colocado estos cuadrados, los trata a todos igual.

Movimiento de jugador:\
Los jugadores controlarán a su personaje mediante las teclas A, D y W. Podrán moverse horizontalmente y saltar. Su movimiento estará regido en parte por la inercia, teniendo cierta aceleración y deceleración.\
El arco del salto dependerá del tiempo que el jugador mantenga pulsada la tecla W. Una vez se haya comenzado el salto con una fuerza inicial, se seguirá añadiendo cierta cantidad de fuerza (hasta un límite de tiempo) para que el jugador tenga un grado de control sobre la altura y duración del salto. Habrá una fuerza de gravedad constante.\
Los jugadores colisionarán con las plataformas en todas direcciones (no podrán atravesarlas desde abajo), y posiblemente con ciertas otras entidades que sean añadidas al juego. No colisionarán entre ellos, y no tendrán manera directa de influenciar al otro personaje.

Cámara:\
La cámara de juego ascenderá a una velocidad constante. Además, tendrá una determinada altura en espacio de pantalla definida. Si un jugador se coloca por encima de esta altura, la cámara ascenderá a una velocidad mayor hasta alcanzar a dicho jugador y haberle colocado por debajo de dicha altura. Una vez haya alcanzado al jugador, volverá a ascender con la velocidad original.\
La superficie del juego que la cámara cubre será siempre constante, es decir, nunca cambiará nivel de zoom.

Condición de fracaso:\
Un jugador pierde la partida en el momento en el que la cámara le deja atras. En términos técnicos, esto siginifica que el sprite del jugador en su totalidad se ha quedado fuera del frustrum por debajo del mismo.
Cuando esto ocurra, la partida terminará y se reproducirá una pequeña animación final.

Condición de victoria:\
El juego no tiene un objetivo explícito para alcanzar la victoria. Un jugador gana cuando su oponente pierde. Para esto tendrá que dejarle atrás, tanto con un movimiento más veloz y preciso tanto con la creación y destrucción estratégica de plataformas.



