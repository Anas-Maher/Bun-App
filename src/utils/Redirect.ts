function name(url: URL | string , status? : number) {
	return Response.redirect(url.toString() , {
		status ,
		headers : {
			'Content-Type' : 
			'application/json'
		}
	})
}
