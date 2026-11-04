import * as T from 'three/webgpu'

/** Faceted sculpture kit. Geometry stays stable when optimization roles change. */
export function makeWolf(world,variant=0){
 const root=new T.Group(),body=new T.Group();root.add(body)
 const add=(geo,mat,x,y,z,sx=1,sy=1,sz=1)=>world.mesh(geo,mat,body,x,y,z,sx,sy,sz)
 const fur=['fur','slate','warm'][variant%3]
 add(new T.IcosahedronGeometry(1,1),fur,-.08,.92,0,1,.47,.38)
 add(new T.IcosahedronGeometry(.62,1),fur,.47,1.13,0,.8,1,.82)
 add(new T.ConeGeometry(.43,.9,7),'light',.49,1.03,0).rotation.z=.22
 add(new T.IcosahedronGeometry(.45,1),fur,.83,1.48,0,.95,1,.9)
 add(new T.CylinderGeometry(.17,.28,.55,6),'light',1.13,1.32,0).rotation.z=-Math.PI/2
 add(new T.IcosahedronGeometry(.13,0),'dark',1.42,1.32,0,1,.75,1)
 for(const side of [-1,1]){
  const ear=add(new T.ConeGeometry(.2,.5,3),fur,.74,1.94,side*.27);ear.rotation.x=side*.16
  add(new T.ConeGeometry(.11,.3,3),'dark',.8,1.98,side*.275)
  add(new T.IcosahedronGeometry(.07,0),'dark',1.05,1.57,side*.3,1,.65,.5)
  add(new T.IcosahedronGeometry(.025,0),'sand',1.09,1.59,side*.325)
  for(const x of [-.61,.49]){
   const leg=add(new T.CylinderGeometry(.15,.1,.67,5),fur,x,.48,side*.25);leg.rotation.z=x<0?-.14:.07
   add(new T.IcosahedronGeometry(.2,0),'light',x+.08,.15,side*.28,1.25,.65,.85)
  }
 }
 const tail=add(new T.ConeGeometry(.24,1.15,6),fur,-1.12,.76,0);tail.rotation.z=-.85
 add(new T.IcosahedronGeometry(.17,0),'light',-1.55,.39,0)
 const collar=add(new T.CylinderGeometry(.34,.34,.16,8),'sand',.57,1.3,0);collar.rotation.z=-.3
 const medallion=add(new T.IcosahedronGeometry(.13,0),'sand',.68,1.12,.35)
 root.userData.accents=[collar,medallion];root.userData.body=body
 return root
}
