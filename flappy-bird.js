import {defs, tiny} from './examples/common.js';
import {Text_Line} from './examples/text-demo.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const MAX_ANGLE = Math.PI / 16;
const DELTA_ANGLE = Math.PI / 64;

class Cube extends Shape {
    constructor() {
        super("position", "normal",);
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);
        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
        this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
            14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
    }
}

export class Bird extends Scene {
    constructor() {
        super();
        this.invincible_active = false;
        this.invincible_start = 0;
        this.invincible_position = vec3(0, Math.random() * 20 + 5, 40);
        this.invincible_duration = 30;
        this.invincible_spawn_chance = 0.025;
        this.invincible_spawned = false;
        this.invincible_radius  = 1;
        this.yelloww = hex_color("#F9DC35");
        this.whitee = hex_color("#FFFFFF");
        this.blackk = hex_color("#000000");
        this.invinsible = false;
        this.shapes = {
            cube: new Cube(),
            sun: new defs.Subdivision_Sphere(4),
            torus: new defs.Torus(20, 10),
            square: new defs.Square(),
            text: new Text_Line(35),
            cylinder: new defs.Cylindrical_Tube(150, 300, [[0, 2], [1, 2]]),
            capped_cylinder: new defs.Rounded_Capped_Cylinder(150, 300, [[0, 2], [1, 2]]),



        };

        this.textures = {
            background: new Texture("assets/Day_bg.png"),
            background_night: new Texture("assets/night_bg.png"),
            lose: new Texture("assets/FInalLose.png"),
        };

        this.materials = {


            plastic: new Material(
                new defs.Phong_Shader(),
                {
                    ambient: .6,
                    diffusivity: .6,
                    specularity: 0,
                    color: hex_color("#ffffff"),
                }),
            pure_color: new Material(
                new defs.Phong_Shader(),
                {
                    ambient: 1,
                    diffusivity: 0,
                    specularity: 0,
                }),
            background: new Material(
                new defs.Fake_Bump_Map(1), {
                    color: hex_color("#000000"),
                    ambient: 1,
                    texture: this.textures.background,
                }),
            background_night: new Material(
                new defs.Fake_Bump_Map(1), {
                    color: hex_color("#000000"),
                    ambient: 1,
                    texture: this.textures.background_night,
                }),
            game_end: new Material(
                new defs.Fake_Bump_Map(1), {
                    color: hex_color("#000000"),
                    ambient: 1, diffusivity: 0.1, specularity: 0.1,
                    texture: this.textures.lose,
                }),
            text_image: new Material(
                new defs.Textured_Phong(1), {
                    ambient: 1,
                    diffusivity: 0,
                    specularity: 0,
                    texture: new Texture("assets/text.png"),
                }),
        }


        this.click_time = 0;
        this.game_start_time = 0;
        this.base_y = 0;
        this.y = 0;
        this.initial_v_y = 6;
        this.angle = 0;
        this.pipe_num = 10;
        this.acceleration = 20;

        this.pipe_lens = Array.from({length: this.pipe_num}, () => Math.floor(Math.random() * 7) + 1.5);
        this.pipe_gap = 20;
        this.pipe_distance = 10;
        this.starting_distance = 10;
        this.game_start = false;
        this.elapsed_time_before_game_start = 0;
        this.game_speed = 5;
        this.sideview = true;
        this.sideview_cam_pos = Mat4.translation(0, -15, -36).times(Mat4.rotation(Math.PI/2, 0, 1, 0));
        this.back_cam_pos = Mat4.translation(-19, -16, -26).times(Mat4.rotation(Math.PI, 0, 1, 0));
        this.game_end = false;
        this.score = 0;
        this.highest_score = 0;
        this.night_theme = false;


        this.pipegap_position  = vec3(0,  Math.random() * 10 + 5, 30);


        this.last_speed_change_time = 0; // Last time the speed changed
        this.total_normal_speed_duration = 0; // Total time spent at normal speed
        this.total_increased_speed_duration = 0;


        this.pipegap_visible = false;
        this.pipegap_last_activation_time = 0;
        this.pipegap_interval = Math.random() * 10 + 5;
        this.normal_speed = 5;

        this.increased_speed = 6;

    }

    invincible_spawn() {
        if (Math.random() < this.invincible_spawn_chance && !this.invincible_spawned) {
            this.invincible_position = vec3(0, Math.random() * 20, 40);
            this.invincible_spawned = true;
        }
    }


    check_power_up_collision() {
        // Check if the bird collides with the power-up
        if (this.invincible_spawned && Math.abs(this.y - this.invincible_position[1]) < this.invincible_radius ) {
            this.invincible_active = true;
            this.invincible = true; // Corrected the typo here
            this.invincible_duration = 5; // Set the duration of the power-up effect (in seconds)
            this.invincible_spawned = false;
        }
    }
    // Enhanced collision detection with the power-up
    invinible_collision() {
        // Only check for collision if the power-up is spawned
        if (!this.invincible_spawned) return;

        const bird_position = vec3(0, this.y, 0); // Assuming the bird's x and z positions are fixed
        const distance_to_power_up = bird_position.minus(this.invincible_position).norm();

        // If the distance between the bird and the power-up is less than the sum of their radii, collision occurs
        if (distance_to_power_up < this.invincible_radius  + 1 /* Assuming bird's radius is 1 */) {
            this.activate_invincible();
        }
    }

    // Function to handle power-up activation
    activate_invincible() {
        this.invincible_active = true;
        this.invincible = true;
        this.invincible_duration = 5; // Duration of the power-up effect in seconds
        this.invincible_spawned = false; // Make the power-up disappear
        this.invincible_start = this.t;
    }




    update_invincible(delta_time) {
        if (this.invincible_active) {

            this.invincible_duration -= delta_time;
            this.blackk = hex_color("#FFFFFF");



            if ((this.t * 10) % 7 < 1) {
                this.whitee = hex_color("#AA6600"); // Deep Orange
                this.yelloww = hex_color("#AAAA00"); // Deep Yellow
            } else if ((this.t * 10) % 7 < 2) {
                this.whitee = hex_color("#AA0000"); // Deep Red
                this.yelloww = hex_color("#AA6600"); // Deep Orange
            } else if ((this.t * 10) % 7 < 3) {
                this.whitee = hex_color("#AAAA00"); // Deep Yellow
                this.yelloww = hex_color("#AA0000"); // Deep Red
            } else if ((this.t * 10) % 7 < 4) {
                this.whitee = hex_color("#00AA00"); // Deep Green
                this.yelloww = hex_color("#AAAA00"); // Deep Yellow
            } else if ((this.t * 10) % 7 < 5) {
                this.whitee = hex_color("#0044AA"); // Deep Blue
                this.yelloww = hex_color("#00AA00"); // Deep Green
            } else if ((this.t * 10) % 7 < 6) {
                this.whitee = hex_color("#6600AA"); // Deep Indigo
                this.yelloww = hex_color("#0044AA"); // Deep Blue
            } else {
                this.whitee = hex_color("#8800AA"); // Deep Violet
                this.yelloww = hex_color("#6600AA"); // Deep Indigo
            }

            if (this.invincible_duration <= 0) {
                this.invincible_active = false;
                this.whitee = hex_color("#FFFFFF");
                this.yelloww = hex_color("#F9DC35");
                this.blackk = hex_color("#000000");
                this.invincible = false;
            }
        }
        if (this.invincible_position[2] < -20) {
            this.invincible_position = vec3(0, 20 + Math.random()*5, 30);
            this.invincible_active = false; // Deactivate invincible power-up
        }
        this.invincible_position[2] -= this.game_speed/60;
    }


    draw_invincibility(context, program_state) {
        if (this.invincible_spawned) {
            // Combine translation, rotation, and scaling transformations
            const model_transform = Mat4.translation(this.invincible_position[0], this.invincible_position[1], this.invincible_position[2])
                .times(Mat4.scale(this.invincible_radius, this.invincible_radius, this.invincible_radius))

            // Draw the torus with the updated transformation
            this.shapes.sun.draw(context, program_state, model_transform, this.materials.plastic.override({color: color(1, 1, 0, 1)}));
        }
    }

    make_control_panel() {
        this.key_triggered_button("Up", ["u"], () => {
            this.click_time = this.t;
            this.base_y = this.y;
            if (!this.game_start) {

                let adjusted_time = this.total_normal_speed_duration * this.normal_speed + this.total_increased_speed_duration * this.increased_speed;

                this.game_start_time = this.t + this.starting_distance / this.game_speed;
                console.log(this.game_start_time);
            }
            this.game_start = true;
            while (this.angle > -MAX_ANGLE) {
                this.angle -= DELTA_ANGLE;
            }
        });
        this.key_triggered_button("Change camera", ["c"], () => {
            this.sideview = !this.sideview;
        });
        this.key_triggered_button("Restart game", ["n"], () => {
            this.game_start = false;
            this.game_end = false;
            this.click_time = 0;
            this.elapsed_time_before_game_start = 0;
            this.angle = 0;
            this.y = 12;
        });
        this.new_line();

        const acceleration_controls = this.control_panel.appendChild(document.createElement("span"));





        this.new_line();

        const initial_v_y_controls = this.control_panel.appendChild(document.createElement("span"));



        this.key_triggered_button("Change theme", ["b"], ()=> {

            this.night_theme = !this.night_theme;
        });
    }



    draw_box(context, program_state, model_transform, color) {
        this.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic.override({color: color}));
    }

    draw_sun(context, program_state, model_transform, color) {
        this.shapes.sun.draw(context, program_state, model_transform, this.materials.plastic.override({color: color}));
    }

    raw_cylinder(context, program_state, model_transform, color) {
        this.shapes.capped_cylinder.draw(context, program_state, model_transform, this.materials.plastic.override({color: color}));
    }

    draw_wings(context, program_state, model_transform, whitee) {
        const left_wing = model_transform.times(Mat4.translation(-0.8, -0.4, -0.4))
            .times(Mat4.scale(0.2, 0.6, 0.8));
        const right_wing = model_transform.times(Mat4.translation(0.8, -0.4, -0.4))
            .times(Mat4.scale(0.2, 0.6, 0.8));
        this.shapes.sun.draw(context, program_state, left_wing, this.materials.plastic.override({color: whitee}));
        this.shapes.sun.draw(context, program_state, right_wing, this.materials.plastic.override({color: whitee}));
    }

    draw_mouth(context, program_state, model_transform) {
        const lip_color = hex_color("#FE9800");
        const upper_lip = model_transform.times(Mat4.translation(0, 0, 1))
            .times(Mat4.scale(0.8, 0.2, 0.6));
        const lower_lip = model_transform.times(Mat4.translation(0, -0.3, 0.5))
            .times(Mat4.scale(0.7, 0.2, 0.8));
        this.shapes.cube.draw(context, program_state, upper_lip, this.materials.plastic.override({color: lip_color}));
        this.shapes.cube.draw(context, program_state, lower_lip, this.materials.plastic.override({color: lip_color}));
    }

    draw_eye(context, program_state, model_transform, whitee, blackk) {
        // right eye
        const right_bg_transform = model_transform.times(Mat4.translation(-0.75, 0.35, 0.7))
            .times(Mat4.scale(0.2, 0.4, 0.4));
        const right_pupil_transform = model_transform.times(Mat4.translation(-0.8, 0.4, 0.8))
            .times(Mat4.scale(0.2, 0.20, 0.15));
        this.shapes.sun.draw(context, program_state, right_bg_transform, this.materials.plastic.override({color: whitee}));
        this.shapes.sun.draw(context, program_state, right_pupil_transform, this.materials.plastic.override({color: blackk}));
        // left eye
        const left_bg_transform = model_transform.times(Mat4.translation(0.75, 0.35, 0.7))
            .times(Mat4.scale(0.2, 0.4, 0.4));
        const left_pupil_transform = model_transform.times(Mat4.translation(0.8, 0.4, 0.8))
            .times(Mat4.scale(0.2, 0.2, 0.15));
        this.shapes.sun.draw(context, program_state, left_bg_transform, this.materials.plastic.override({color: whitee}));
        this.shapes.sun.draw(context, program_state, left_pupil_transform, this.materials.plastic.override({color: blackk}));
    }

    draw_bird(context, program_state, model_transform, yelloww) {
        const body_transform = model_transform.times(Mat4.scale(0.8, 1, 1.2));
        this.draw_sun(context, program_state, body_transform, yelloww);
        this.draw_wings(context, program_state, model_transform, this.whitee, this.blackk);
        this.draw_mouth(context, program_state, model_transform);
        this.draw_eye(context, program_state, model_transform, this.whitee, this.blackk);
    }

    draw_pipe(context, program_state, model_transform, pipe_len) {
        const pipe_body_transform = model_transform.times(Mat4.scale(1, pipe_len * 2, 1))
            .times(Mat4.rotation(Math.PI / 2, 1, 0, 0));
        const green = hex_color("#528A2C");
        const dark_green = hex_color("#000000");
        const pipe_top_transform = model_transform.times(Mat4.translation(0, pipe_len, 0))
            .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
            .times(Mat4.scale(1.4, 1.4, 0.5));
        this.raw_cylinder(context, program_state, pipe_top_transform, green);
        const pipe_inner_top_transform = model_transform.times(Mat4.translation(0, pipe_len, 0))
            .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
            .times(Mat4.scale(1, 1, 0.501));
        this.raw_cylinder(context, program_state, pipe_inner_top_transform, dark_green);
        this.raw_cylinder(context, program_state, pipe_body_transform, green);
    }

    update_y(time_after_click) {
        const dist_from_base_y = this.initial_v_y * time_after_click - 0.5 * this.acceleration * time_after_click * time_after_click;
        this.y = dist_from_base_y + this.base_y >= 0 ? dist_from_base_y + this.base_y : 0;
        this.y = time_after_click === 0 ? 12 : this.y;
        if (this.y === 0) {
            this.game_end = true;
        }
    }

    update_angle(time_after_click) {
        const angle_rate = DELTA_ANGLE * (1 + time_after_click);
        const angle = this.angle + time_after_click * angle_rate;
        this.angle = angle > MAX_ANGLE ? MAX_ANGLE : angle;
    }

    draw_all_pipe(context, program_state, model_transform) {
        for (let i = 0; i < this.pipe_num; i++) {
            const pipe_len = this.pipe_lens[i];
            //draw the bottom pipes
            const bottom_pipe_model_transform = model_transform.times(Mat4.translation(0, pipe_len - 11, i * this.pipe_distance));
            this.draw_pipe(context, program_state, bottom_pipe_model_transform, pipe_len);
            //draw top pipe
            const top_pipe_model_transform = model_transform.times(Mat4.translation(0, this.pipe_gap - (9 - pipe_len), i * this.pipe_distance))
                .times(Mat4.rotation(Math.PI, 1, 0, 0));
            this.draw_pipe(context, program_state, top_pipe_model_transform, 9 - pipe_len);
            this.check_bird_collision(top_pipe_model_transform, bottom_pipe_model_transform, pipe_len);
        }
    }




    check_bird_collision(top_pipe, bottom_pipe, pipe_len) {
        if (this.invincible_active || this.invincible) return;
        //determine collision on top and bottom
        if (bottom_pipe[2][3] < 3 && bottom_pipe[2][3] > -2) {
            const bottom_pipe_position = {
                rec_x_pos: bottom_pipe[2][3] - 0.5,
                rec_y_pos: 0,
                rec_width: 1,
                rec_height: pipe_len * 2
            };
            if (this.in_collision_with(bottom_pipe_position)) {
                this.game_end = true;
            }
        }
        if (top_pipe[2][3] < 3 && top_pipe[2][3] > -2) {
            const top_pipe_position = {
                rec_x_pos: top_pipe[2][3] - 0.5,
                rec_y_pos: (this.pipe_gap - 9) + pipe_len * 2,
                rec_width: 1,
                rec_height: (9 - pipe_len) * 2
            };
            if (this.in_collision_with(top_pipe_position)) {
                this.game_end = true;
            }
        }
    }

    draw_three_sets_of_pipe(context, program_state, model_transform, t) {
        const game_elapsed_time = t - this.elapsed_time_before_game_start;
        const pipe_set_length = this.pipe_distance * this.pipe_num;
        // if the game has started, pipe set 1 position is calculated, else, it will be the starting_distance
        const pipe_pos1 = this.game_start ? (this.starting_distance - game_elapsed_time * this.game_speed) % pipe_set_length : this.starting_distance;
        const pipe_pos2 = pipe_pos1 + this.pipe_distance * this.pipe_num;
        const pipe_pos3 = pipe_pos1 - this.pipe_distance * this.pipe_num;

        const starting_pipe_model_transform1 = model_transform.times(Mat4.translation(0, 10, pipe_pos1));
        this.draw_all_pipe(context, program_state, starting_pipe_model_transform1);

        const starting_pipe_model_transform2 = model_transform.times(Mat4.translation(0, 10, pipe_pos2));
        this.draw_all_pipe(context, program_state, starting_pipe_model_transform2);

        if (this.game_start && (t - this.elapsed_time_before_game_start) * this.game_speed / this.pipe_distance > 5) {
            const starting_pipe_model_transform3 = model_transform.times(Mat4.translation(0, 10, pipe_pos3));
            this.draw_all_pipe(context, program_state, starting_pipe_model_transform3);
        }
    }

    in_collision_with(pipe_position) {
        const { rec_x_pos, rec_y_pos, rec_width, rec_height } = pipe_position;
        //bird only changes its y location
        const circle_x_pos = 0.5, circle_y_pos = this.y, circle_radius = 1;
        // temporary variables to set edges for testing
        let closest_x = circle_x_pos;
        let closest_y = circle_y_pos;
        // which edge is closest?
        if (circle_x_pos < rec_x_pos) {
            closest_x = rec_x_pos; // compare to left edge
        } else if (circle_x_pos > rec_x_pos + rec_width) {
            closest_x = rec_x_pos + rec_width; // right edge
        }
        if (circle_y_pos < rec_y_pos) {
            closest_y = rec_y_pos; // bottom edge
        } else if (circle_y_pos > rec_y_pos + rec_height) {
            closest_y = rec_y_pos + rec_height; // top edge
        }
        // get distance from the closest edges
        const distX = circle_x_pos - closest_x;
        const distY = circle_y_pos - closest_y;
        const distance = Math.sqrt((distX * distX) + (distY * distY));
        return distance <= circle_radius;
    }

    draw_ground(context, program_state, model_transform) {
        const ground_model_transform = model_transform.times(Mat4.scale(40, 1, 60))
            .times(Mat4.translation(0, -1, 0));
        const green = hex_color(this.night_theme ? "53873d" : "#82C963");
        this.shapes.cube.draw(context, program_state, ground_model_transform, this.materials.pure_color.override({color: green}));
    }

    draw_background(context, program_state, model_transform, t, type) {
        const rotation_angle = (type === "f" || type === "b") ? Math.PI / 2 : Math.PI;
        const translation_x = (type === "f" || type === "r") ? 40 : -40;
        const translation_z = type === "r" ? 60 : (type === "l" ? -60 : Math.sin(-t / 3) * 25);
        const background_transform = model_transform.times(Mat4.translation(translation_x, 65 - 1 / 5 * this.y, translation_z))
            .times(Mat4.rotation(rotation_angle, 0, 1, 0))
            .times(Mat4.scale(85, 85, 1));
        this.shapes.square.draw(
            context,
            program_state,
            background_transform,
            this.night_theme ?
                this.materials.background_night :
                this.materials.background,
        );
    }
    draw_pipegap(context, program_state) {
        // Only draw the power-up if it's visible
        if (this.pipegap_visible) {
            const power_up_transform = Mat4.translation(...this.pipegap_position ).times(Mat4.scale(1, 1, 1));
            this.shapes.sun.draw(context, program_state, power_up_transform, this.materials.plastic.override({color: color(1, 1, 1, 1)}));
        }
    }
    draw_all_backgrounds(context, program_state, model_transform, t) {
        this.draw_background(context, program_state, model_transform, t, "f");
        this.draw_background(context, program_state, model_transform, t, "b");
        this.draw_background(context, program_state, model_transform, t, "l");
        this.draw_background(context, program_state, model_transform, t, "r");
    }

    draw_score(context, program_state, model_transform) {
        const sideview_transform = model_transform.times(Mat4.translation(-3, 25, 5))
            .times(Mat4.rotation(3 * Math.PI / 2, 0, 1, 0));
        const backview_transform = model_transform.times(Mat4.translation(-3, 25, 5))

            .times(Matrix.of([-1, 0, 0, 0],[0, 1, 0, 0],[0, 0, 1, 0],[0, 0, 0, 1]));

        const scoreboard_model_transform = this.sideview ? sideview_transform : backview_transform;

        const time_per_pipe = this.pipe_distance / this.game_speed;
        const raw_score = this.game_start ? Math.ceil((this.t - this.game_start_time) / time_per_pipe) : 0;
        this.score = raw_score > 0 ? raw_score : 0;
        this.highest_score = Math.max(this.score, this.highest_score);

        const score_string = "Score: " + this.score.toString();
        this.shapes.text.set_string(score_string, context.context);
        this.shapes.text.draw(context, program_state, scoreboard_model_transform, this.materials.text_image);

    }
    check_collision_with_power_up() {
        const distance = this.pipegap_position.minus(vec3(0, this.y, 0)).norm();
        return distance < 2;

    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(Mat4.translation(0, -14, -36).times(Mat4.rotation(Math.PI / 2, 0, 1, 0)));
            program_state.set_camera(this.sideview_cam_pos);
        }
        const delta_time = program_state.animation_delta_time / 1000;

        this.invincible_spawn();
        this.update_invincible(delta_time);

        const matrix_transform = Mat4.identity();
        const light_position = vec4(0, 5, 5, 1);
        const light_intensity = this.night_theme ? 100 : 1000;
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), light_intensity)];
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 100);
        const t = this.t = program_state.animation_time / 1000;
        const t_after_click = this.click_time === 0 ? 0 : t - this.click_time;

        this.elapsed_time_before_game_start = this.game_start ? this.elapsed_time_before_game_start : t; //keep track of the time before user begin to play

        this.invinible_collision();

        if(this.game_start === false){
            this.pipegap_visible = false;
            this.invincible_spawned = false;
            this.invincible = false;
            this.pipegap_last_activation_time = 0;

        }

        this.update_y(t_after_click);
        this.update_angle(t_after_click);
        const model_transform = matrix_transform.times(Mat4.translation(0, this.y, 0))
            .times(Mat4.rotation(this.angle, 1, 0, 0));

        if (!this.game_end) {
            this.draw_invincibility(context, program_state);
            this.draw_bird(context, program_state, model_transform, this.yelloww);

            // Draw power-up if it's currently visible
            if (this.pipegap_visible) {
                this.draw_pipegap(context, program_state);
            }



            this.draw_ground(context, program_state, matrix_transform);
            this.draw_all_backgrounds(context, program_state, matrix_transform, t);
            this.draw_three_sets_of_pipe(context, program_state, matrix_transform, t);
            this.draw_score(context, program_state, matrix_transform);
        } else {
            //draw game end scene
            program_state.set_camera(this.sideview_cam_pos);
            this.sideview = true;
            this.shapes.square.draw(context, program_state, matrix_transform.times(Mat4.translation(0, 10, 0))
                .times(Mat4.rotation(Math.PI / 2 * 3, 0, 1, 0))
                .times(Mat4.scale(28, 28, 1)), this.materials.game_end);

            const score_model_transform = matrix_transform.times(Mat4.translation(-3, 8, -12))
                .times(Mat4.rotation(3 * Math.PI / 2, 0, 1, 0));
            const score_string = "Score: " + this.score.toString();
            this.shapes.text.set_string(score_string, context.context);
            this.shapes.text.draw(context, program_state, score_model_transform, this.materials.text_image);

            const highscore_model_transform = matrix_transform.times(Mat4.translation(-3, 6, -12))
                .times(Mat4.rotation(3 * Math.PI / 2, 0, 1, 0));
            const highscore_string = "Highest score: " + this.highest_score.toString();
            this.shapes.text.set_string(highscore_string, context.context);
            this.shapes.text.draw(context, program_state, highscore_model_transform, this.materials.text_image);

            const replay_model_transform = matrix_transform.times(Mat4.translation(-3, 4, -12))
                .times(Mat4.rotation(3 * Math.PI / 2, 0, 1, 0));
            const replay_string = "Replay with \"n\"";
            this.shapes.text.set_string(replay_string, context.context);
            this.shapes.text.draw(context, program_state, replay_model_transform, this.materials.text_image);

        }





        const time_since_last_activation = program_state.animation_time / 1000 - this.pipegap_last_activation_time;

        if (!this.pipegap_visible && time_since_last_activation > this.pipegap_interval) {
            // Activate power-up
            this.pipegap_visible = true;
            //this.invincible_position = vec3(0,    Math.random() * 25 + 5, 20);
            this.pipegap_interval = Math.random() * 10 + 8; // Reset activation interval

        }
        if (this.pipegap_visible) {
            // Calculate relative movement speed of power-up
            const power_up_speed = this.game_speed * delta_time;

            // Update power-up position based on relative speed
            this.pipegap_position[2] -= power_up_speed; // Adjust the z-coordinate based on movement direction

            // Check if power-up is out of bounds
            if (this.pipegap_position[2] < -40) { // Assuming the background moves 40 units
                this.pipegap_visible = false; // Hide the power-up if it's out of bounds
                this.pipegap_position = vec3(0, Math.random() * 20 + 7, 20 + Math.random()*10);
                //this.pipegap_interval = Math.random() * 10 + 5; // Reset activation interval

            }
        }
        // Check for collision with the bird if power-up is visible
        if (this.pipegap_visible && this.check_collision_with_power_up()) {
            this.pipegap_visible = false; // Hide power-up
            this.pipegap_last_activation_time = program_state.animation_time / 1000; // Record activation time
            const initialPipeGap = 25;
            const finalPipeGap = 20;
            const increaseDuration = 5 * 1000; // 5 seconds
            const decreaseDuration = 5 * 1000; // 5 seconds

            let elapsedTime = 0;
            const increaseIntervalId = setInterval(() => {
                this.yelloww = hex_color("#0000FF");
                this.invincible_position
                this.pipe_gap += 0.01;
                elapsedTime += 10; // 0.5 seconds
                if (elapsedTime >= increaseDuration) {
                    clearInterval(increaseIntervalId);

                    // Use setInterval to gradually decrease the pipe gap
                    const decreaseIntervalId = setInterval(() => {
                        this.pipe_gap -= 0.01;
                        elapsedTime += 10; // 0.5 seconds
                        if (elapsedTime > increaseDuration + decreaseDuration) {
                            clearInterval(decreaseIntervalId);
                            this.yelloww = hex_color("#F9DC35");
                            this.pipe_gap = finalPipeGap;
                        }
                    }, 10); // Update every 0.5 seconds for decreasing
                }
            }, 10); // Update every 0.5 seconds for increasing
        }





        const blending_factor = 0.1;
        if (!this.sideview) {
            // change to back cam position
            const desired = this.back_cam_pos;
            const transition = desired.map((x, i) => Vector.from(program_state.camera_inverse[i]).mix(x, blending_factor));
            program_state.set_camera(transition);
        } else {
            // change to side view
            const desired = this.sideview_cam_pos;
            const transition = desired.map((x, i) => Vector.from(program_state.camera_inverse[i]).mix(x, blending_factor));
            program_state.set_camera(transition);
        }
    }
}