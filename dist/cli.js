#!/bin/env node
import{Command as w,InvalidArgumentError as x,Option as $}from"commander";import h from"axios";import{load as b}from"cheerio";var u=class{constructor(e,r,t){this.user=e;this.repo=r;this.stars=t}getUrl(){return`https://github.com/${this.user}/${this.repo}`}};async function y(s,e){let r=[],t;do{let a;try{a=await(await h.get(s,{})).data}catch(o){return o.response&&console.log("Error response status",o.response.status),console.log("Error",o.message),r}let n=b(a);t===void 0&&(t=Number(n("svg.octicon-code-square").parent().text().replace(/[^0-9]/g,"")));let l=n('[data-test-id="dg-repo-pkg-dependent"]');for(let o=0;o<l.length;o++){let i=l[o],c=n(i).find('a[data-hovercard-type="user"],a[data-hovercard-type="organization"]').eq(0).text(),d=n(i).find('a[data-hovercard-type="repository"]').eq(0).text(),f=n(i).find("svg.octicon-star").parent().text();if((c===""||d==="")&&console.error(`Failed to get user and/or repo for repo ${c}/${d}.`),r.push(new u(c,d,Number(f))),e!==void 0&&r.length>=e)return console.log(`Went through ${r.length}/${t} repos...`),r}let g=n('.paginate-container .btn.BtnGroup-item:contains("Next")').eq(0);s=g.length?g.attr("href"):null,console.log(`Went through ${r.length}/${t} repos...`)}while(s);return r}async function m(s,e=void 0,r){let t=await y(s,e);return r==="desc"?t.sort((a,n)=>n.stars-a.stars):r==="asc"&&t.sort((a,n)=>a.stars-n.stars),t}var p=new w;p.name("github-dependents").description("CLI to fetch GitHub dependents and sort by stars.").version("1.0.0-alpha.0");p.command("fetch",{isDefault:!0}).description("Fetch dependents from GitHub").argument("<repo>","repo url, eg. https://github.com/ilimic1/github-dependents").option("-m, --max <count>","maximum number of repos to scan/return, eg. 300",s=>{let e=parseInt(s,10);if(isNaN(e))throw new x("Count must be a number.");return e}).addOption(new $("-s, --sort <direction>","optionally sort by stars").choices(["asc","desc"]).default("desc")).option("--no-sort","disable default sorting by stars").action(async(s,e)=>{console.log(s,e);let r=e.max?parseInt(e.max):void 0,t;e.sort==="desc"?t="desc":e.sort==="asc"?t="asc":t=void 0,(await m(`${s}/network/dependents`,r,t)).forEach(n=>{console.log(`${n.getUrl()} ${n.stars}`)})});p.parse();
//# sourceMappingURL=cli.js.map