function Login(){
	var pseudo=document.login.pseudo.value;
	var password=document.login.password.value;
    console.log(pseudo,password)
	if (pseudo=="4dm1n" && password=="n1kL3s4utr3sSp3") {
	    alert("Bien joué ! Voici ton flag : CS29{cl1ent_s1de_n0_secret}");
	} else {
	    alert("T'es trop nul");
	}
}
