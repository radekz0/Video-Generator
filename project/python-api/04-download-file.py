import boto3
MY_BUCKET = '217026'
s3 = boto3.client('s3')

s3.download_file(MY_BUCKET, 'foo/animal.txt', 'animal.txt')