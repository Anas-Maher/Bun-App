function redirect(url: URL | string , status? : number) {
	return Response.redirect(url.toString() , {
		status ,
		headers : {
			'Content-Type' : 
			'application/json'
		}
	})
}


export default redirect;