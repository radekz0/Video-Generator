import boto3
MY_BUCKET = '217026'
s3 = boto3.resource('s3')
bucket = s3.Bucket(MY_BUCKET)

my_bear = '''
  _,-""`""-~`)
(`~_,=========
 |---,___.-.__,
 |        o     \ ___  _,,,,_     _.--.
  \      `^`    /`_.-"~      `~-;`     
   \_      _  .'                 `,     |
     |`-                           \'__/ 
    /                      ,_       \  `'-. 
   /    .-""~~--.            `"-,   ;_    /
  |              \               \  | `""`
   \__.--'`"-.   /_               |'
              `"`  `~~~---..,     |
 jgs                         \ _.-'`-.
                              \       
                               '.     /
                                 `"~"`
'''
bucket.put_object(
    Key = "foo/animal.txt",
    Body = bytes(my_bear, 'utf-8')
)