
import requests
import yaml
import re
import json
import os

def fetch_yaml(link,title):
        try:
                response = requests.get(link)
                response.raise_for_status()
                data = response.text
                print(".",end="")
                f = open(f"resources/sig_data/{title}.yaml","w")
                f.write(data)
                f.close()
                print(".",end="")
                pattern = re.compile(r'[^\x09\x0A\x0D\x20-\x7E]') # https://yaml.org/spec/1.1/#id868524
                data_object = yaml.safe_load(pattern.sub('', data))
                f = open(f"resources/sig_data/{title}.json","w")
                f.write(json.dumps(data_object))
                f.close()
                print(".",end="")
                print(" Success!")
        except Exception as e:
                print(" Fail!")
                print(e)
                
                          
def get_latest_data():
        
        title_arr = ["company_identifiers","mmdl_model_uuids","mesh_model_uuids"]
        link_arr = ["https://bitbucket.org/bluetooth-SIG/public/raw/main/assigned_numbers/company_identifiers/company_identifiers.yaml","https://bitbucket.org/bluetooth-SIG/public/raw/main/assigned_numbers/mesh/mmdl_model_uuids.yaml","https://bitbucket.org/bluetooth-SIG/public/raw/main/assigned_numbers/mesh/mesh_model_uuids.yaml"]
        
        if not os.path.isdir("resources/sig_data"):
                os.mkdir("resources/sig_data")
                print("Created folder for sig_data")

        for i, link in enumerate(link_arr):
                print(f"Trying to fecth the latest {title_arr[i]} data",end="")
                fetch_yaml(link,title_arr[i])
        
get_latest_data()