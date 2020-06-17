import x from '/home/akachicon/projects/react-playground/src/client/app/components/hello';

const y = import('@app/components/nested-dir/nested');

y.then((data) => console.log(data));

console.log(x, y);
