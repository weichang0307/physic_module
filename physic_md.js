/*
require modules:
vector_md,
*/

 
/*
mass: kg
long: m
*/


class physic_rect{
	constructor(x,y,width,height,mass=0,resistance_vec2=new vec2(0,0)){
		this.type='rect'  					//幾何種類
		this.position=new vec2(x,y)			//位置(x方向，y方向)
		this.velocity=new vec2(0,0)			//速度(x方向，y方向)
		this.scale=new vec2(width,height)	//大小(寬，高)
		this.mass=mass						//質量
		this.resistance=resistance_vec2		//阻尼(x方向，y方向)
		this.isgravity=true					//是否受重力影響
		this.iscollition=true				//是否碰撞
		this.collision=function(e){}		//碰撞時的call back
	}
	//使用canvas在網頁上畫出此矩形
	draw_helper(color,fill=true,through=1,ctx_=ctx){
		ctx_.globalAlpha=through
		ctx_.fillStyle=color
		ctx_.strokeStyle=color 
		if(fill){
			ctx_.fillRect(this.position.x-this.scale.x/2,this.position.y-this.scale.y/2,this.scale.x,this.scale.y)
		}else{
			ctx_.strokeRect(this.position.x-this.scale.x/2,this.position.y-this.scale.y/2,this.scale.x,this.scale.y)
		}
		ctx_.globalAlpha=1
	}
}

class physic_ball{
	constructor(x,y,radius,mass=0,resistance_vec2=new vec2(0,0)){
		this.type='ball'					//幾何種類
		this.position=new vec2(x,y)			//位置(x方向，y方向)
		this.velocity=new vec2(0,0)			//速度(x方向，y方向)
		this.radius=radius					//半徑
		this.mass=mass						//質量
		this.resistance=resistance_vec2		//阻尼(x方向，y方向)
		this.isgravity=true					//是否受重力影響
		this.iscollition=true				//是否碰撞
		this.collision=function(e){}		//碰撞時的call back
	}
	//使用canvas在網頁上畫出此圓形
	draw_helper(color,fill=true,through=1,ctx_=ctx){
		ctx_.globalAlpha=through
		ctx_.fillStyle=color
		ctx_.strokeStyle=color
		ctx_.beginPath()
		ctx_.arc(this.position.x,this.position.y,this.radius,0,Math.PI*2)
		ctx_.closePath() 
		if(fill){
			ctx_.fill()	
		}else{
			ctx_.stroke()
		}
		ctx_.globalAlpha=1
	}


}
class physic_world{
	constructor(gravityx,gravityy,iteration=500){
		this.gravity=new vec2(gravityx,gravityy)	//world中的重力加速度
		this.objs=[]								//陣列(儲存加入到world中的幾何物件)
		this.iteration=iteration					//每次update的迭代次數
	}
	//加入幾何物件到objs
	add(obj){
		this.objs.push(obj)
	}
	//從objs刪除幾何物件
	delete(obj){
		for(let i in this.objs){
			if(obj===this.objs[i]){
				this.objs.splice(i,1)
			}
		}
	}
	//將world的時間推進(time)毫秒
	update(time){
		let time_=time/this.iteration
		for(let k=0;k<this.iteration;k++){
			
			//重力及阻力
			for(let i of this.objs){
				i.velocity.x*=(1-i.resistance.x)**(time_)
				i.velocity.y*=(1-i.resistance.y)**(time_)

				if(i.isgravity){
					i.velocity=i.velocity.add(this.gravity.scale(time_))
				}
			}
			//碰撞
			for(let i=0;i<this.objs.length-1;i++){
				for(let y=i+1;y<this.objs.length;y++){
					if(this.objs[i].iscollition||this.objs[y].iscollition){
						this.collision(this.objs[i],this.objs[y])
					}
				}
			}
			//改變位置
			for(let i of this.objs){
				i.position=i.position.add(i.velocity.scale(time_))
			}

		}
	}
	//偵測並進行兩物體間的碰撞
	collision(a,b){
		//複製速度(call back用)
		let va=a.velocity.copy()
		let vb=b.velocity.copy()
		//分辨碰撞種類
		if(a.type==='rect'&&b.type==='rect'){
			collision_rect_rect(a,b)
		}
		else if(a.type==='ball'&&b.type==='ball'){
			collision_ball_ball(a,b)
		}
		else if(a.type==='ball'&&b.type==='rect'){
			collision_ball_rect(a,b)
		}
		else if(a.type==='rect'&&b.type==='ball'){
			collision_ball_rect(b,a)
		}
		//若速度有改變則call back
		if(va.equal(a.velocity)===false){
			for(let i of this.objs){
				if(i!==a&&i!==b){
					this.collision(i,a)
				}
			}
		}
		if(vb.equal(b.velocity)===false){
			for(let i of this.objs){
				if(i!==b&&i!==a){
					this.collision(i,b)
				}
			}
		}
	}
}
function my_calculate(a,b){
	//return a/a+b
	if(a!==Infinity&&b!==Infinity){
		return a/(a+b)
	}else if(a===Infinity&&b!==Infinity){
		return 1
	}else if(a!==Infinity&&b===Infinity){
		return 0
	}else if(a===Infinity&&b===Infinity){
		return 1/2
	}
}
//碰撞 矩形-矩形
function collision_rect_rect(A,B){
	//A對於B的相對位置
	let pAB=A.position.minus(B.position)
	//若是A與B有重疊
	if(Math.abs(pAB.x)*2<A.scale.x+B.scale.x&&Math.abs(pAB.y)*2<A.scale.y+B.scale.y){
		//A與B重疊區域的高與寬
		let border_dis_x=(A.scale.x+B.scale.x)/2-Math.abs(pAB.x)
		let border_dis_y=(A.scale.y+B.scale.y)/2-Math.abs(pAB.y)
		//A對於B的相對速度
		let vAB=A.velocity.minus(B.velocity)
		//若重疊區域高大於寬則判定為左右碰撞
		if(border_dis_x<border_dis_y){
			//若相對位置與相對速度為反向 => 逐漸靠近
			if(Math.sign(pAB.x)===-Math.sign(vAB.x)){
				//一維完全彈性碰撞
				A.velocity.x-=2*vAB.x*my_calculate(B.mass,A.mass)
				B.velocity.x+=2*vAB.x*my_calculate(A.mass,B.mass)
				//callback
				if(Math.sign(pAB.x)<0){
					A.collision({side:"right",obj:B})
					B.collision({side:"left",obj:A})
				}else{
					A.collision({side:"left",obj:B})
					B.collision({side:"right",obj:A})
				}
			}
		//否則判定為上下碰撞
		}else{
			//若相對位置與相對速度為反向 => 逐漸靠近
			if(Math.sign(pAB.y)===-Math.sign(vAB.y)){
				//一維彈性碰撞
				A.velocity.y-=2*vAB.y*my_calculate(B.mass,A.mass)
				B.velocity.y+=2*vAB.y*my_calculate(A.mass,B.mass)
				//callback	
				if(Math.sign(pAB.y)<0){
					A.collision({side:"top",obj:B})
					B.collision({side:"bottom",obj:A})
				}else{
					A.collision({side:"bottom",obj:B})
					B.collision({side:"top",obj:A})
				}
			}
		}
	}
}
//碰撞 球-球
function collision_ball_ball(A,B){
	//A對於B的相對位置
	let pAB=A.position.minus(B.position)
	//若是A與B有重疊(距離<A半徑+B半徑)
	if(pAB.long()<A.radius+B.radius){
		//A對於B的相對速度								
		let vAB=A.velocity.minus(B.velocity)
		//若內積<0 => 夾角>90。 => 逐漸靠近
		if(pAB.dot(vAB)<0){
			//A對於B的法線相對速度
			let vAB_normal=vAB.divide2(pAB.deg()).normal
			//一維彈性碰撞
			B.velocity.add_in(vAB_normal.scale(2*my_calculate(B.mass,A.mass)))
			A.velocity.minus_in(vAB_normal.scale(2*my_calculate(A.mass,B.mass)))
			//call back
			A.collision({deg:pdeg,obj:B})
			B.collision({deg:pdeg+Math.PI,obj:A})
		}
	}
}
//碰撞 球-矩形
function collision_ball_rect(A,B){
	//A對於B的相對位置
	let pAB=A.position.minus(B.position)
	//A對於B的相對速度
	let vAB=A.velocity.minus(B.velocity)
	//若是X距離<B的寬/2 且 Y距離<B的高/2+A的半徑 則判定為A與B的頂部或底部接觸
	if(Math.abs(pAB.y)<B.scale.y/2+A.radius&&Math.abs(pAB.x)<B.scale.x/2){
		//若相對位置與相對速度為反向 => 逐漸靠近
		if(Math.sign(pAB.y)===-Math.sign(vAB.y)){
			//一維彈性碰撞
			A.velocity.y-=2*vAB.y*my_calculate(B.mass,A.mass)
			B.velocity.y+=2*vAB.y*my_calculate(A.mass,B.mass)
			//call back
			if(pAB.y>0){
				A.collision({side:"bottom",obj:B})
				B.collision({side:"top",obj:A})
			}else{
				A.collision({side:"top",obj:B})
				B.collision({side:"bottom",obj:A})
			}
		}
	//若是Y距離<B的高/2 且 X距離<B的寬/2+A的半徑 則判定為A與B的側邊接觸
	}else if(Math.abs(pAB.x)<B.scale.x/2+A.radius&&Math.abs(pAB.y)<B.scale.y/2){
		if(Math.sign(pAB.x)===-Math.sign(vAB.x)){
			//一維彈性碰撞
			A.velocity.x-=2*vAB.x*my_calculate(B.mass,A.mass)
			B.velocity.x+=2*vAB.x*my_calculate(A.mass,B.mass)
			//call back
			if(pAB.x>0){
				A.collision({side:"left",obj:B})
				B.collision({side:"right",obj:A})
			}else{
				A.collision({side:"right",obj:B})
				B.collision({side:"left",obj:A})
			}
		}
	//否則可能為A與B的角接觸
	}else{
		//A對於B對應角的相對位置
		let pABcorner=new vec2()
		pABcorner.x=pAB.x-B.scale.x/2*Math.sign(pAB.x)
		pABcorner.y=pAB.y-B.scale.y/2*Math.sign(pAB.y)
		//若A與B對應角的距離<A的半徑 則判定為A與B的角接觸
		if(pABcorner.long()<A.radius){
			//若內積<0 => 夾角>90。 => 逐漸靠近
			if(pABcorner.dot(vAB)<0){
				//A對於B對應角的法線相對速度
				let vABcorner_normal=vAB.divide2(pABcorner.deg()).normal
				//一維彈性碰撞
				B.velocity.add_in(vABcorner_normal.scale(2*my_calculate(A.mass,B.mass)))
				A.velocity.minus_in(vABcorner_normal.scale(2*my_calculate(B.mass,A.mass)))
				//call back
				A.collision({deg:vABcorner_normal.deg(),obj:A})
				let str=''
				if(pAB.y>0){
					str+='top'
				}else{
					str+='bottom'
				}
				if(pAB.x>0){
					str+='right'
				}else{
					str+='left'
				}
				B.collision({side:str,obj:B})
				
				
			}
			
			
		}
	}
	
}
