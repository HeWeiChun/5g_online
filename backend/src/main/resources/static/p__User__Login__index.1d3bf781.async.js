"use strict";(self.webpackChunkant_design_pro=self.webpackChunkant_design_pro||[]).push([[366],{85578:function(k,E,e){var I=e(12309),v=e(10582),X=e(50959),h=e(37787),B=e(11527),S=["fieldProps","proFieldProps"],A=["fieldProps","proFieldProps"],p="text",D=function(i){var P=i.fieldProps,j=i.proFieldProps,Z=(0,v.Z)(i,S);return(0,B.jsx)(h.Z,(0,I.Z)({valueType:p,fieldProps:P,filedConfig:{valueType:p},proFieldProps:j},Z))},U=function(i){var P=i.fieldProps,j=i.proFieldProps,Z=(0,v.Z)(i,A);return(0,B.jsx)(h.Z,(0,I.Z)({valueType:"password",fieldProps:P,proFieldProps:j,filedConfig:{valueType:p}},Z))},y=D;y.Password=U,y.displayName="ProFormComponent",E.Z=y},63741:function(k,E,e){e.r(E),e.d(E,{default:function(){return pe}});var I=e(13448),v=e.n(I),X=e(77117),h=e.n(X),B=e(74815),S=e.n(B),A=e(28152),p=e.n(A),D=e(60483),U=e(63096),y=e(63815),W=e(97605),i=e(50959),P={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M832 464h-68V240c0-70.7-57.3-128-128-128H388c-70.7 0-128 57.3-128 128v224h-68c-17.7 0-32 14.3-32 32v384c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32zM332 240c0-30.9 25.1-56 56-56h248c30.9 0 56 25.1 56 56v224H332V240zm460 600H232V536h560v304zM484 701v53c0 4.4 3.6 8 8 8h40c4.4 0 8-3.6 8-8v-53a48.01 48.01 0 10-56 0z"}}]},name:"lock",theme:"outlined"},j=P,Z=e(38782),q=function(o,r){return i.createElement(Z.Z,(0,W.Z)({},o,{ref:r,icon:j}))},_=i.forwardRef(q),m=e(12309),ee=e(10582),te=e(34835),ne=e(84919),re=e(84875),ae=e.n(re),se=e(58534),z=e(25201),oe=e(60422),ie=function(o){var r;return r={},(0,z.Z)(r,o.componentCls,{"&-container":{display:"flex",flex:"1",flexDirection:"column",height:"100%",paddingInline:32,paddingBlock:24,overflow:"auto",background:"inherit"},"&-top":{textAlign:"center"},"&-header":{display:"flex",alignItems:"center",justifyContent:"center",height:"44px",lineHeight:"44px",a:{textDecoration:"none"}},"&-title":{position:"relative",insetBlockStart:"2px",color:"@heading-color",fontWeight:"600",fontSize:"33px"},"&-logo":{width:"44px",height:"44px",marginInlineEnd:"16px",verticalAlign:"top",img:{width:"100%"}},"&-desc":{marginBlockStart:"12px",marginBlockEnd:"40px",color:o.colorTextSecondary,fontSize:o.fontSize},"&-main":{minWidth:"328px",maxWidth:"580px",margin:"0 auto","&-other":{marginBlockStart:"24px",lineHeight:"22px",textAlign:"start"}}}),(0,z.Z)(r,"@media (min-width: @screen-md-min)",(0,z.Z)({},"".concat(o.componentCls,"-container"),{paddingInline:0,paddingBlockStart:32,paddingBlockEnd:24,backgroundRepeat:"no-repeat",backgroundPosition:"center 110px",backgroundSize:"100%"})),r};function le(s){return(0,oe.Xj)("LoginForm",function(o){var r=(0,m.Z)((0,m.Z)({},o),{},{componentCls:".".concat(s)});return[ie(r)]})}var t=e(11527),de=["logo","message","contentStyle","title","subTitle","actions","children","containerStyle","otherStyle"];function ce(s){var o,r=s.logo,R=s.message,H=s.contentStyle,T=s.title,C=s.subTitle,L=s.actions,Q=s.children,F=s.containerStyle,x=s.otherStyle,l=(0,ee.Z)(s,de),K=(0,te.YB)(),V=l.submitter===!1?!1:(0,m.Z)((0,m.Z)({searchConfig:{submitText:K.getMessage("loginForm.submitText","\u767B\u5F55")}},l.submitter),{},{submitButtonProps:(0,m.Z)({size:"large",style:{width:"100%"}},(o=l.submitter)===null||o===void 0?void 0:o.submitButtonProps),render:function(n,w){var G,xe=w.pop();if(typeof(l==null||(G=l.submitter)===null||G===void 0?void 0:G.render)=="function"){var O,$;return l==null||(O=l.submitter)===null||O===void 0||($=O.render)===null||$===void 0?void 0:$.call(O,n,w)}return xe}}),b=(0,i.useContext)(ne.ZP.ConfigContext),M=b.getPrefixCls("pro-form-login"),g=le(M),u=g.wrapSSR,d=g.hashId,a=function(n){return"".concat(M,"-").concat(n," ").concat(d)},c=(0,i.useMemo)(function(){return r?typeof r=="string"?(0,t.jsx)("img",{src:r}):r:null},[r]);return u((0,t.jsxs)("div",{className:ae()(a("container"),d),style:F,children:[(0,t.jsxs)("div",{className:"".concat(a("top")," ").concat(d).trim(),children:[T||c?(0,t.jsxs)("div",{className:"".concat(a("header")),children:[c?(0,t.jsx)("span",{className:a("logo"),children:c}):null,T?(0,t.jsx)("span",{className:a("title"),children:T}):null]}):null,C?(0,t.jsx)("div",{className:a("desc"),children:C}):null]}),(0,t.jsxs)("div",{className:a("main"),style:(0,m.Z)({width:328},H),children:[(0,t.jsxs)(se.A,(0,m.Z)((0,m.Z)({isKeyPressSubmit:!0},l),{},{submitter:V,children:[R,Q]})),L?(0,t.jsx)("div",{className:a("main-other"),style:x,children:L}):null]})]}))}var Y=e(85578),ue=e(15860),N=e(39228),ve=e(79334),J=e(22796),me=e(88140),ge=e(10422),fe=function(o){var r=o.content;return(0,t.jsx)(ve.Z,{style:{marginBottom:24},message:r,type:"error",showIcon:!0})},he=function(){var o=(0,i.useState)({}),r=p()(o,2),R=r[0],H=r[1],T=(0,i.useState)("account"),C=p()(T,2),L=C[0],Q=C[1],F=(0,N.useModel)("@@initialState"),x=F.initialState,l=F.setInitialState,K=(0,ue.l)(function(){return{display:"flex",flexDirection:"column",height:"100vh",overflow:"auto",backgroundImage:"url('/loginBackgroundImage.png')",backgroundSize:"100% 100%"}}),V=function(){var g=S()(v()().mark(function u(){var d,a;return v()().wrap(function(f){for(;;)switch(f.prev=f.next){case 0:return f.next=2,x==null||(d=x.fetchUserInfo)===null||d===void 0?void 0:d.call(x);case 2:a=f.sent,a&&(0,ge.flushSync)(function(){l(function(n){return h()(h()({},n),{},{currentUser:a})})});case 4:case"end":return f.stop()}},u)}));return function(){return g.apply(this,arguments)}}(),b=function(){var g=S()(v()().mark(function u(d){var a,c;return v()().wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.prev=0,n.next=3,(0,U.x4)(h()(h()({},d),{},{type:L}));case 3:if(a=n.sent,a.status!=="ok"){n.next=11;break}return J.ZP.success("\u767B\u5F55\u6210\u529F\uFF01"),n.next=8,V();case 8:return c=new URL(window.location.href).searchParams,N.history.push(c.get("redirect")||"/"),n.abrupt("return");case 11:console.log(a),H(a),n.next=19;break;case 15:n.prev=15,n.t0=n.catch(0),console.log(n.t0),J.ZP.error("\u767B\u5F55\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\uFF01");case 19:case"end":return n.stop()}},u,null,[[0,15]])}));return function(d){return g.apply(this,arguments)}}(),M=R.status;return(0,t.jsxs)("div",{className:K,children:[(0,t.jsx)(N.Helmet,{children:(0,t.jsxs)("title",{children:["\u767B\u5F55","- ",me.Z.title]})}),(0,t.jsx)("div",{style:{flex:"1",padding:"32px 0"},children:(0,t.jsxs)(ce,{contentStyle:{minWidth:280,maxWidth:"75vw"},logo:(0,t.jsx)("img",{alt:"logo",src:"/buptlogo.svg"}),title:"\u5317\u4EAC\u90AE\u7535\u5927\u5B66",subTitle:"5G\u6838\u5FC3\u7F51\u5F02\u5E38\u68C0\u6D4B\u7CFB\u7EDF",initialValues:{autoLogin:!0},onFinish:function(){var g=S()(v()().mark(function u(d){return v()().wrap(function(c){for(;;)switch(c.prev=c.next){case 0:return c.next=2,b(d);case 2:case"end":return c.stop()}},u)}));return function(u){return g.apply(this,arguments)}}(),children:[M==="error"&&(0,t.jsx)(fe,{content:"\u9519\u8BEF\u7684\u7528\u6237\u540D\u548C\u5BC6\u7801(admin)"}),L==="account"&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(Y.Z,{name:"username",fieldProps:{size:"large",prefix:(0,t.jsx)(y.Z,{})},placeholder:"\u7528\u6237\u540D: admin",rules:[{required:!0,message:"\u7528\u6237\u540D\u662F\u5FC5\u586B\u9879\uFF01"}]}),(0,t.jsx)(Y.Z.Password,{name:"password",fieldProps:{size:"large",prefix:(0,t.jsx)(_,{})},placeholder:"\u5BC6\u7801: admin",rules:[{required:!0,message:"\u5BC6\u7801\u662F\u5FC5\u586B\u9879\uFF01"}]})]})]})}),(0,t.jsx)(D.$_,{})]})},pe=he}}]);
