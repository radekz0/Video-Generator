import boto3
MY_BUCKET = '217026'
s3 = boto3.resource('s3')
bucket = s3.Bucket(MY_BUCKET)


with open('beaver.txt', 'rb') as to_be_uploaded:
    bucket.put_object(
        Key="foo/beaver.txt",
        Body=to_be_uploaded
    )