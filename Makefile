
release-import: 
	docker build -t importexcel . 
	
	docker save -o importexcel importexcel