let worker = new Worker("compiler_worker.js");
let input = document.getElementById('compilerInput');

let compile = () => {
    worker.postMessage(JSON.stringify({
        language: "Solidity",
        sources: {"": { content: input.value}},
        settings: { outputSelection: { "*": {"*": ['evm.bytecode.object', 'evm.gasEstimates']}}}
    }));
}
input.addEventListener('change', compile);
input.addEventListener('keyup', compile);
worker.addEventListener('message', (message) => {
    if (message.data.version !== undefined) {
        document.getElementById("compiler_version").innerText = message.data.version;
        compile();
    } else if (message.data.result !== undefined) {
        let result = JSON.parse(message.data.result);
        console.log(result);
        let errors = document.getElementById('compiler_errors');
        errors.innerHTML = '';
        if (result.errors === undefined) {
            errors.innerHTML = 'Compilation successful.<br/>';
            for (contractName in result.contracts['']) {
                let contract = result.contracts[''][contractName];
                errors.innerHTML += '<strong>' + contractName + '</strong><br/>';
                errors.innerHTML += 'Code size: ' + contract.evm.bytecode.object.length / 2 + ' bytes.<br/>';
                errors.innerHTML += 'Deployment costs: ' + contract.evm.gasEstimates.creation.totalCost + ' gas.<br/>';
                errors.innerHTML += 'Bytecode: ' + contract.evm.bytecode.object.slice(0, 35) + '...<br/>';            }
        } else {
            for (error of result.errors) {
                errors.innerHTML += '<pre>' + error.formattedMessage + '</pre>';
            }
        }
    }
});