let worker = new Worker("compiler_worker.js");
let editor = ace.edit("compilerInput");

let compile = () => {
    worker.postMessage(JSON.stringify({
        language: "Solidity",
        sources: {"": { content: editor.getValue()}},
        settings: { optimizer: { enabled: true }, outputSelection: { "*": {"*": ['evm.bytecode.object', 'evm.gasEstimates', 'evm.assembly']}}}
    }));
}

editor.session.setMode("ace/mode/javascript");
editor.getSession().setUseWorker(false);
editor.renderer.on('afterRender', compile);

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
            errors.innerHTML = '';
            for (contractName in result.contracts['']) {
                let contract = result.contracts[''][contractName];
                errors.innerHTML += '<strong>' + contractName + ' (' + contract.evm.bytecode.object.length / 2 + ' bytes)</strong><br/>';
                errors.innerHTML += 'Deployment costs: ' + contract.evm.gasEstimates.creation.totalCost + ' gas.<br/>';
                errors.innerHTML += 'Bytecode:<textarea>' + contract.evm.bytecode.object + '</textarea>';
                errors.innerHTML += 'Assembly:<textarea>' + contract.evm.assembly + '</textarea>';
            }
        } else {
            for (error of result.errors) {
                errors.innerHTML += '<h4>Errors:</h4><pre>' + error.formattedMessage + '</pre>';
            }
        }
    }
});