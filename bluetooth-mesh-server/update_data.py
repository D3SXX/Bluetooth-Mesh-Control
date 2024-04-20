
import requests
import yaml
import re
import json
def get_latest_data():
        print("Trying to fecth the latest company_identifiers.yaml")
        try:
                response = requests.get("https://bitbucket.org/bluetooth-SIG/public/raw/main/assigned_numbers/company_identifiers/company_identifiers.yaml")
                response.raise_for_status()
                data = response.text
                f = open("resources/company_identifiers/list.yaml","w")
                f.write(data)
                f.close()
                pattern = re.compile(r'[^\x09\x0A\x0D\x20-\x7E]') # https://yaml.org/spec/1.1/#id868524
                data_object = yaml.safe_load(pattern.sub('', data))
                f = open("resources/company_identifiers/list.json","w")
                f.write(json.dumps(data_object))
                print("Success!")
        except Exception as e:
                print("Failed to fetch the file")
                print(e)
                
get_latest_data()