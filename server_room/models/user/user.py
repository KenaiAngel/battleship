from abc import ABC, classmethod

class User (ABC):
    @classmethod
    def __init__(self,id, nickname, type):
        self.id = id
        self.nickname = nickname