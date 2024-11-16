
samlocal delete --stack-name my-stack --region eu-west-2 --no-prompts
aws --endpoint-url=http://localhost:4566 s3 mb s3://my-bucket
samlocal package --template-file template.yaml --s3-bucket my-bucket --output-template-file packaged-template.yaml
samlocal deploy --template-file packaged-template.yaml --guided
