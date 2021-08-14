import Victor from "victor";
import "../css/styles.css"
const canvas: any = document.getElementById('main_canvas');
const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

class Screen {
    context: CanvasRenderingContext2D;
    objects: any[];
    width: number;
    height: number;
    frame_rate: number;
    constructor(context: CanvasRenderingContext2D, width: number, height: number, frame_rate: number) {
        this.context = context;
        this.objects = [];
        this.width = width;
        this.height = height;
        this.frame_rate = frame_rate;
    };
    addObject(object: object) {
        this.objects.push(object)
    };
    renderObjects() {
        this.objects.forEach(object => {
            object.render();
        });
    };
    clear() {
        this.context.clearRect(0, 0, this.width, this.height);
    };
    startRendering() {
        setInterval(() => {
            this.clear();
            this.objects.forEach(object => {
                object.step()
                object.checkCollisionFromList(this.objects)
            });
            this.renderObjects();
            console.log("ran")
        }, 0);
    };
};

class Ball {
    type: string;
    context: CanvasRenderingContext2D;
    x: number;
    y: number;
    velocity: Victor;
    acceleration: Victor;
    appliedForces: Victor[];
    radius: number;
    color: string;
    frame_rate: number;
    constructor(context: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, frame_rate: number) {
        this.type = "ball";
        this.context = context;
        this.x = x;
        this.y = y;
        this.velocity = new Victor(0, 0)
        this.acceleration = new Victor(0, 0)
        this.appliedForces = []
        this.radius = radius;
        this.color = color;
        this.frame_rate = frame_rate;
    };
    render() {
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 360, false);
        this.context.fillStyle = this.color;
        this.context.fill();
    };
    addForce(force: Victor, duration: number) {
        this.appliedForces.push(force);
        if(duration == 0) return;

        setTimeout(() => {
            this.removeForce(force);
            this.acceleration.subtract(force.multiply(new Victor(duration/1000, duration/1000)))
        }, duration)
    };
    removeForce(force: Victor) {
        const force_index = this.appliedForces.indexOf(force);
        this.appliedForces[force_index] = undefined;
    };
    checkCollisionFromList(object_list: Ball[]) {
        this.isCollidingWithWall(1920, 1080)
        object_list.forEach(object => {
            if(this.isCollidingWithBall(object)) {
                this.adjustPositions(object)
                this.switchVelocities(object)
            };
        });
    }
    isCollidingWithBall(ball: Ball) {
        if(ball != this && ball.type == "ball") {
            let distance_x = Math.abs(ball.x - this.x);
            let distance_y = Math.abs(ball.y - this.y);
            let distance = distance_x + distance_y;
            return distance < (this.radius + ball.radius)
        };
    };
    isCollidingWithWall(screen_width: number, screen_height: number) {
        if(this.x - this.radius < 0) {
            this.x = this.radius;
            this.velocity.invertX();
        }
        if(this.y - this.radius < 0) {
            this.y = this.radius;
            this.velocity.invertY();
        }
        if(this.x + this.radius > screen_width) {
            this.x = screen_width - this.radius;
            this.velocity.invertX();
        }
        if(this.y + this.radius > screen_height) {
            this.y = screen_height - this.radius;
            this.velocity.invertY();
        }
    }
    adjustPositions(ball: Ball) {
        let between_lines_vector = new Victor(ball.x - this.x, ball.y - this.y);
        between_lines_vector.norm().multiply(new Victor(this.radius + ball.radius, this.radius + ball.radius));
        ball.x = this.x + between_lines_vector.toObject().x;
        ball.y = this.y + between_lines_vector.toObject().y;
        return

        //the code above is still being tested
        
        if(this.x > ball.x) {this.x = ball.x + (this.radius + ball.radius + 1); console.log("yo")};//has switch glitches
        if(this.x < ball.x) {this.x = ball.x - (this.radius + ball.radius + 1); console.log("ya")};
        if(this.y > ball.y) {this.y = ball.y + (this.radius + ball.radius + 1); console.log("ye")};
        if(this.y < ball.y) {this.y = ball.y - (this.radius + ball.radius + 1); console.log("yi")};
    }
    switchVelocities(ball:Ball) {
        const other_ball_velocity = ball.velocity;
        const this_ball_velocity = this.velocity;
        ball.velocity = this_ball_velocity;
        this.velocity = other_ball_velocity;
    }
    step() {
        let final_force = new Victor(0, 0);
        this.appliedForces.forEach(force => {
            if(!force) return;
            final_force.add(force)
        });
        this.acceleration = final_force;
        this.velocity.add(this.acceleration);
        this.x += this.velocity.toObject().x;
        this.y += this.velocity.toObject().y;
    }
};

const myscreen = new Screen(ctx, 1920, 1080, 0);
const myball = new Ball(ctx, 300, 200, 20, "red", 60 )
const myball2 = new Ball(ctx, 300, 700, 20, "blue", 60 )
const myball3 = new Ball(ctx, 600, 700, 40, "yellow", 60 )

myscreen.addObject(myball)
myscreen.addObject(myball2)
myscreen.addObject(myball3)

myball.addForce(new Victor(0.05, 0.03), 1000);
myball.addForce(new Victor(0.00, 0.098), 0);
myball2.addForce(new Victor(0.03, -0.03), 1000);
myball2.addForce(new Victor(0.00, 0.098), 0);
myball3.addForce(new Victor(0.00, 0.098), 0);
myball3.addForce(new Victor(0.06, -0.04), 1000);

document.addEventListener('keypress', event => {
    console.log(30 + Math.floor(myscreen.width / Math.random()))
    if (event.key == " ") {
        const new_ball = new Ball(
            ctx,
            30 + Math.floor(Math.random() * (myscreen.width - 30)),
            30 + Math.floor(Math.random() * (myscreen.height - 30)),
            5 + Math.floor(50 * Math.random()),
            "white",
            60)
        myscreen.addObject(new_ball);
        let x_force_value = Math.random() / 10;
        if((Math.floor(Math.random() * (10 - 1)) % 2) == 0) x_force_value = -x_force_value;
        let y_force_value = Math.random() / 10;
        if((Math.floor(Math.random() * (10 - 1)) % 2) == 0) y_force_value = -y_force_value;
        new_ball.addForce(new Victor(x_force_value, y_force_value), 1000);
        new_ball.addForce(new Victor(0.00, 0.098), 0);
        
        
    }
  })

myscreen.startRendering()