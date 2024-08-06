const person = {
    name: 'John',
    age: 30,
    job: 'Developer',
    nested:{
        qualification:'class 10',
        skills:{
            role:"programming"
        }
    }
};

// Destructuring assignment
// const { id, age, job, salark='44k' } = person;
const { id, age, job,salary="44k" ,nested:{qualification,skills:{role}} } = person;

const info=person.name
const dob=person.age
console.log(role)

console.log(info)

console.log(id); // John
console.log(age); // 30
console.log(job); // Developer
console.log(salary)
console.log(role)
