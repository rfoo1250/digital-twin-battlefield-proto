import os

print("CWD:", os.getcwd())

filename = r"C:\Users\user\Desktop\digital-twin-proto\gym\scripts\simple_demo\simple_demo.json"  # change this to the file you want to check

if os.path.isfile(filename):
    print(f"{filename} exists in the current directory.")
else:
    print(f"{filename} does not exist in the current directory.")
