<?php
	
	

	/*

	  * YOUR EMAIL ***

	*/

	

	

	$adminEmail = "mail@yourdomain.com";

	

	

	/*

	  * VALIDATE EMAIL ***

	*/

	

	

	function validateEmail($email){

		return eregi("^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$", $email);

	}

	

	

	/*

	  * CHECK FORM ***

	*/

	

	

	$post = (!empty($_POST)) ? true : false;

	

	if($post) {

		

		$name = stripslashes($_POST['name']);

		$email = trim($_POST['email']);

		$subject = "Info";

		$message = stripslashes($_POST['message']);

		$error = '';

		

		
		/*

		  * CHECK MESSAGE ***

		*/

		
		

		if(!$message || $message == "Message") {

			$error = "Please, type in a message.";

		}
		

		

		/*

		  * CHECK MAIL ***

		*/

		
		

		if($email && !validateEmail($email) || $email == "Email") {

			$error = "Please, check your e-mail address.";

		}




		if(!$email || $email == "Email") {

			$error = "Please, type in your e-mail address.";

		}

		
		

		/*

		  * CHECK NAME ***

		*/

		
		

		if(!$name || $name == "Name") {

			$error = "Please, type in your name.";

		}

		
		

		/*

		  * ACTION ***

		*/
		

		

		if(!$error) {

			$mail = mail($adminEmail, $subject, $message,

     			"From: ".$name." <".$email.">\r\n"

    			."Reply-To: ".$email."\r\n"

    			."X-Mailer: PHP/" . phpversion());

			if($mail) {

				echo '<p class="pk_form_success">Your message has been sent. Thanks.</p>';

			}

		} else {

			echo '<p class="pk_form_error">'.$error.'</p>';

		}
		
		

	}

?>