console.log(gsap);
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');


canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector('#scoreEl');
const startGameBtn = document.querySelector('#startGameBtn');
const modalEl = document.querySelector('#modalEl');
const bigScoreEl = document.querySelector('#bigScoreEl');

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
       this.draw()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
       this.draw()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update() {
       this.draw()
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x ;
        this.y = this.y + this.velocity.y ;
        this.alpha -= 0.01;
    }
}

const y = canvas.height / 2;
const x = canvas.width / 2;

let player = new Player(x, y, 10, 'white');
let projectiles = [];
let enemies = [];
let particles= [];

function init() {
    player = new Player(x, y, 10, 'white');
    projectiles = [];
    enemies = [];
    particles= [];
    score = 0;
}

function spawnEnemies() {
    setInterval(() => {
    const radius = Math.random() * (30 - 5) + 5;
    
    let x;
    let y;

    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
        y = Math.random() * canvas.height;
    } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    //const color = 'green';
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    const angle = Math.atan2(
        canvas.height / 2 - y,
        canvas.width / 2 - x
    );

    const velocity = {
        x:Math.cos(angle),
        y:Math.sin(angle)
    };
    
        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 2500)

}

let animationId;
let score = 0;

function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0,0, canvas.width, canvas.height)
    player.draw();

    particles.forEach((particle, index) => {
        particle.update();
        if (particle.alpha <=0) {
            particles.splice(index, 1);
        }
    })

    projectiles.forEach(((projectile, index) => {
        projectile.update();

        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height

            ) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    }))

    enemies.forEach((enemy, index) => {
            enemy.update();

            const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

            if (dist - enemy.radius - player.radius < 1) {
                var snd = new Audio("morri.wav"); // buffers automatically when created
                snd.play();
                cancelAnimationFrame(animationId);
                modalEl.style.display = 'flex'
                bigScoreEl.innerHTML = score;
                init();
            }

            projectiles.forEach((projectile, projectileIndex) => {
                const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
                
                //projectiles touch enemy
                if (dist - enemy.radius - projectile.radius < 1) 
                {
                    //explosions
                    for (let index = 0; index < enemy.radius * 5; index++) {
                        const radius = Math.random() * 2;
                        particles.push(
                            new Particle(
                                projectile.x, 
                                projectile.y, 
                                radius, 
                                enemy.color, 
                                { 
                                    x: Math.random() - 0.5 * (Math.random() * 6), 
                                    y: Math.random() - 0.5 * (Math.random() * 6)
                                }
                            )
                        )
                    }
                    if (enemy.radius - 10 > 5) {
                        var snd = new Audio("soft.wav"); // buffers automatically when created
                        snd.play();
                        //increase score
                        score += 100;
                        scoreEl.innerHTML = score;
                        gsap.to(enemy, {
                            radius: enemy.radius - 10
                        })
                        setTimeout(() => {
                            //touch
                            projectiles.splice(projectileIndex, 1);
                        }, 0)
                    } else {
                        var snd = new Audio("explosion.wav"); // buffers automatically when created
                        snd.play();
                        //increase score
                        score += 250;
                        scoreEl.innerHTML = score;
                        setTimeout(() => {
                            //touch
                            enemies.splice(index, 1);
                            projectiles.splice(projectileIndex, 1);
                        }, 0)
                    }
                }
            })
        }   
    )
}

addEventListener('click', (event) => 
    {        
        console.log(projectiles)
        const angle = Math.atan2(
                event.clientY - canvas.height / 2,
                event.clientX - canvas.width / 2
        );

        const velocity = {
            x:Math.cos(angle) * 6,
            y:Math.sin(angle) * 6
        };

        console.log(angle)
        projectiles.push(new Projectile (canvas.width / 2, canvas.height / 2, 5, 'white', velocity))
        
        var snd = new Audio("shot.mp3"); // buffers automatically when created
        snd.play();

       // (new Audio()).canPlayType("audio/ogg; codecs=vorbis")

    }
)

startGameBtn.addEventListener('click', () =>
{
    animate();
    spawnEnemies();
    modalEl.style.display = 'none'

})

let maisPertoY
let maisPertoX

addEventListener('keypress',() => 
    {
        if (enemies.length == 0) {return}

        novoY = Math.min.apply(Math, enemies.map(function(o) { return o.y; }))
        maisPertoY = enemies.filter(enemy => enemy.y == novoY);

        novoX = Math.min.apply(Math, enemies.map(function(o) { return o.x; }))
        maisPertoX = enemies.filter(enemy => enemy.x == novoX);


        
        //novoX = Math.min.apply(Math, enemies.map(function(o) { return o.x; }))
        
        const angle = Math.atan2(
            maisPertoY[0].y - canvas.height / 2,
            maisPertoY[0].x - canvas.width / 2
        );

        const angleX = Math.atan2(
            maisPertoX[0].y - canvas.height / 2,
            maisPertoX[0].x - canvas.width / 2
        );

        const velocity = {
            x:Math.cos(angle) * 6,
            y:Math.sin(angle) * 6
        };

        const velocityX = {
            x:Math.cos(angleX) * 6,
            y:Math.sin(angleX) * 6
        };

        console.log(angle)
        projectiles.push(new Projectile (canvas.width / 2, canvas.height / 2, 5, 'white', velocity))

        projectiles.push(new Projectile (canvas.width / 2, canvas.height / 2, 5, 'white', velocityX))
    }
)