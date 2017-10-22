import numpy as np

def sinewave(f):
    srate = 16000
    return lambda i: np.sin(2 * np.pi * f * i / srate)

def zero_spectrum(fs):
    sines = map(sinewave, fs)
    return lambda i: sum(map(lambda f: f(i), sines)) / len(fs)

def spectrum(fs):
    amplitude = 32767
    zsp = zero_spectrum(fs)
    return lambda i: (zsp(i) + 1) * amplitude

def gen_sample():
    fs = [1000, 2400]
    sp = spectrum(fs)
    waveform = np.fromfunction(sp, (16000,))
    intform = np.array(np.floor(waveform), dtype=np.uint16)
    return np.reshape(intform, (50, 320))


