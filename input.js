class mouse{
    static pos = { x: 0, y: 0 };
    static down = false;
    static right = false;
    static start(element=document.documentElement) {
        function mousemove(e) {
            let br = element.getBoundingClientRect();
            mouse.pos.x = e.clientX - br.left;
            mouse.pos.y = e.clientY - br.top;
        }

        function mouseup(e) {
            if(e.which == 1){
                mouse.down = false;
            } else if(e.which == 3){
                mouse.right = false;
            }
        }

        function mousedown(e) {
            mousemove(e);
            if(e.which == 1){
                mouse.down = true;
            } else if(e.which == 3){
                mouse.right = true;
            }
        }
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
        document.addEventListener('mousedown', mousedown);
        // document.addEventListener('touchstart',mousemove);
        // document.addEventListener('touchmove',mousemove);
        // document.addEventListener('touchend',mouseup);
        document.addEventListener('contextmenu',e=>{e.preventDefault()});
    }
}
class keys{
    static keys = [];
    static start(){
        function keydown(e){
            keys.keys[e.key] = true;
        }
        function keyup(e){
            keys.keys[e.key] = false;
        }
        document.addEventListener('keydown',keydown);
        document.addEventListener('keyup',keyup);
    }
    static down(key){
        if(key in keys.keys){
            return keys.keys[key];
        }
        return false;
    }
}