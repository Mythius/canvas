class Vector{
	static distance(x1,y1,x2,y2){
		return Math.sqrt((x2-x1)**2+(y2-y1)**2);
	}
	static getDir(x,y){
		return (Math.atan(y/x)+(x<0?0:Math.PI))*180/Math.PI;
	}
	static rad(deg){
		return deg*Math.PI/180;
	}
	static getPointIn(dir,dist,ox=0,oy=0){
		let x = ox + Math.cos(dir) * dist;
		let y = oy + Math.sin(dir) * dist;
		return new Vector(x,y);
	}
	constructor(x,y){
		this.x = x;
		this.y = y;
	}
}
function Line(px1=0,py1=0,px2=1,py2=1){
	var x1 = px1;
	var y1 = py1;
	var x2 = px2;
	var y2 = py2;
	function setPos(px1,py1,px2,py2){
		x1 = px1;
		y1 = py1;
		x2 = px2;
		y2 = py2;
	}
	function getPosA(){return new Vector(x1,y1)}
	function getPosB(){return new Vector(x2,y2)}
	function touches(line){
		let posA = line.getPosA();
		let posB = line.getPosB();
		const x3 = posA.x;
		const y3 = posA.y;
		const x4 = posB.x;
		const y4 = posB.y;
		const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if(den == 0){
			return;
		}
		const t =  ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
		const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
		if(t >= 0 && t <= 1 && u >= 0 && u <= 1){
			const pt = new Vector();
			pt.x = x1 + t * (x2-x1);
			pt.y = y1 + t * (y2-y1);
			return pt;
		}
		else return;
	}
	function draw(color='white'){
		ctx.beginPath();
		ctx.lineWidth = 3;
		ctx.strokeStyle = color;
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2,y2);
		ctx.stroke();
	}	this.getPosA = getPosA;
	this.getPosB = getPosB;
	this.touches = touches;
	this.draw = draw;
	this.setPos = setPos;
}
class Animation{
	static xml(path,fn){
	    var x=new XMLHttpRequest();
	    x.onreadystatechange=function(){
	        if(this.readyState==4&&this.status==200) fn(this.responseText);
	    }
	    x.open("GET",path,true);
	    x.send();
	}
	#animID=0;
	#frLists=[];
	#dir="";
	constructor(element,data){
		var file = JSON.parse(data);
		this.file = file;
		this.frames = [];
		this.element = element;
		this.current_frame = 0;
		this.#animID=0;
		this.#frLists = file.frames.map(e=>e.frames)
		this.names = file.frames.map(e=>e.name);
		this.fps = 30;
		this.frame_count = file.count;
		this.#dir = file.dirname;
		this.isLoop = false;
		this.playing = false;
		this.name = "";
		this.last_time = new Date().getTime();
		this.next_frame = document.createElement('img');
		this.end = () => {};
		for(let i=0;i<this.frame_count;i++){
			this.frames.push(this.pad(i));
		}
		this.element.src = this.frames[0];
		this.next_frame.src = this.frames[0];
	}
	pad(n){
		let len = (this.frame_count+'').length;
		return this.#dir+'/'+('0'.repeat(len)+n).slice(-len)+'.png';
	}
	loop(){
		if(!this.playing) return;
		let t = new Date().getTime();
		let diff = t-this.last_time;
		if(diff > 1000/this.fps){
			if(this.current_frame<this.#frLists[this.#animID].length){
				let id = this.#animID;
				this.element.src = this.next_frame.src;
				this.next_frame.src=this.frames[this.#frLists[id][this.current_frame]];
				this.current_frame++;
			} else {
				if(this.isLoop){
					this.current_frame=0;
					this.loop();
				} else {
					this.playing = false;
					this.stop();
				}
			}
			this.last_time = t;
		}
	}
	play(name,is_loop=false){
		if(this.name == name) return;
		this.stop();
		const THIS = this;
		if(this.playing) return new Promise(resolve=>{resolve();});
		this.isLoop = is_loop;
		this.playing = true;
		this.current_frame = 0;
		var index = this.names.indexOf(name);
		if(index!=-1){
			this.fps = this.file.frames[index].fps;
			this.#animID = index;
			this.name = name;
			this.current_frame = 0;
			this.next_frame.src = this.frames[this.#frLists[index][2%this.#frLists[index].length]]
			this.last_time = new Date().getTime();
			return new Promise(resolve=>{
				THIS.end=()=>{
					resolve();
				}
			});
		} else {
			console.warn('Not a valid Animation: '+name);
			return new Promise(resolve=>{resolve()});
		}
	}
	stop(){
		this.element.src = this.frames[this.#frLists[this.#animID][0]];
		this.playing = false;
		this.isLoop = false;
		this.name = "";
		this.end();
	}
}
function Hitbox(x,y,w,h){
	var dir = 0;
	var px = x; // Position (Center)
	var py = y; // Position (Center)
	var width = w;
	var height = h;
	var w2 = width / 2;
	var h2 = height / 2;
	var scaleX = 1;
	var scaleY = 1;
	var offsetX = 0;
	var offsetY = 0;
	var dist;
	var l1 = new Line();
	var l2 = new Line();
	var l3 = new Line();
	var l4 = new Line();
	var a1;
	var a2;
	var a3;
	var a4;
	var lines;
	var angles;
	update();
	function draw(color='white'){
		ctx.fillStyle = color;
		ctx.fillRect(px-1,py-1,3,3);
		for(let l of lines){
			l.draw(color);
		}
	}
	function update(){
		let points = [];
		w2 = (width / 2) * scaleX;
		h2 = (height / 2) * scaleY;
		l1.setPos(px-w2,py-h2,px-w2,py+h2);
		l2.setPos(px-w2,py+h2,px+w2,py+h2);
		l3.setPos(px+w2,py+h2,px+w2,py-h2);
		l4.setPos(px+w2,py-h2,px-w2,py-h2);
		lines = [l1,l2,l3,l4];
		a1 = Vector.getDir(-w2*scaleX,-h2*scaleY);
		a2 = Vector.getDir(w2*scaleX,-h2*scaleY);
		a3 = Vector.getDir(-w2*scaleX,h2*scaleY);
		a4 = Vector.getDir(w2*scaleX,h2*scaleY);
		angles = [a1,a3,a4,a2];
		dist = Vector.distance(px,py,px-w2,py-h2)
		for(let i=0;i<4;i++){
			let ln = lines[i];
			let an = angles[i];
			let pt = Vector.getPointIn(Vector.rad(dir+an),dist,px+offsetX,py+offsetY);
			points.push(pt);
		}
		for(let i=4;i<8;i++){
			let pt1 = points[i%4];
			let pt2 = points[(i-1)%4];
			lines[i%4].setPos(pt1.x,pt1.y,pt2.x,pt2.y);
		}
	}
	function setDir(d){
		dir = d;
		update();
	}
	function setPos(x,y){
		px = x;
		py = y;
		scroll.x = -x + canvas.width/2;
		update();
	}
	function touches(hitbox){
		if(!hitbox.lines) return false;
		let other_lines = hitbox.lines;
		for(let l1 of lines){
			for(let l2 of other_lines){
				if(l1.touches(l2)){
					return true;
				}
			}
		}
		return false;
	}
	function setWidth(w){
		width = w;
		w2 = width / 2;
		// update();
	}
	function setHeight(h){
		height = h;
		h2 = height / 2;
		// update();
	}
	function scale(x=1,y=1){
		scaleX = x;
		scaleY = y;
		update();
	}
	function setOffset(x=0,y=0){
		offsetX = x;
		offsetY = y;
		update();
	}
	this.setWidth = setWidth;
	this.setHeight = setHeight;
	this.lines = lines;
	this.setDir = setDir;
	this.getDir = () => dir;
	this.getPos = () => {return new Vector(px,py)};
	this.DRAW = draw;
	this.touches = touches;
	this.setPos = setPos;
	this.update = update;
	this.scale = scale;
	this.setOffset = setOffset;
	this.data = () => {
		return {dir,pos:new Vector(px,py),width,height,dist,lines,angles,scaleX,scaleY};
	}
}
class Sprite extends Hitbox{
	static HITBOXES = false;
	constructor(image_path){
		var once = false;
		super(50,50,100,100);
		const THIS = this;
		this.element = document.createElement('img');
		this.element.src = image_path;
		this.animation;
		this.transformX = 1;
		this.element.onload = function(){
			if(once) return;
			once = true;
			THIS.setWidth(THIS.element.width);
			THIS.setHeight(THIS.element.height);
			THIS.update();
		}
		this.move = data => {};
	}
	draw(){
		if(Sprite.HITBOXES) this.DRAW();
		if(this.animation) this.animation.loop();
		this.move(this.data());
		let pos = this.getPos();
		let drawPos = this.lines[2].getPosA();
		let dat = this.data();
		ctx.save();
		ctx.translate(pos.x,pos.y);
		ctx.rotate(Vector.rad(this.getDir()));
		ctx.scale(this.transformX,1);
		ctx.drawImage(this.element,-dat.width/2,-dat.height/2);
		ctx.restore();
	}
	addAnimation(animation_path){
		return new Promise(resolve=>{
			Animation.xml(animation_path,data=>{
				this.animation = new Animation(this.element,data);
				resolve();
			});
		});
	}
	addMovement(callback){
		this.move = callback;
	}
}