let a = ' n  hello  n  '

console.log(a.trim().split(" ").join(''))


let c = " hi"

console.log(c.trimStart())

let b = c.repeat(3)
console.log(b)

let j = "hello"

let i = j.match(/ll/g) 
console.log(i)

console.log(j.padEnd(10, '#'))  


let space = "a1bcd1aefg1haijka"
let regS1 = space.match(/\d/g).join('')
let regS = space.match(/a+/ig)


console.log(regS)